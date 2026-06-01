import { supabase } from '../supabaseClient';

// Legacy dedicated-guide request used by /request-trip/:guideId.
// Caller still passes the user id positionally as "travelerId".
export async function createTripRequest(travelerId, tripData) {
  const { data, error } = await supabase
    .from('trip_requests')
    .insert({
      user_id: travelerId,
      destination: tripData.destination,
      start_date: tripData.dates?.start || null,
      end_date: tripData.dates?.end || null,
      adults: tripData.groupSize || 1,
      tour_type: tripData.tourType || null,
      requirements: tripData.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Guide: fetch all open trip requests ───────────────────────────────────────
// Returns every open request the guide could still see, including ones they've
// already applied to. Each trip carries `my_slot` (the guide's existing slot
// row, or null) so the UI can swap the Apply button for a "Proposal submitted"
// pill instead of hiding the card.

export async function getAvailableTripRequests(guideId) {
  const { data: trips, error } = await supabase
    .from('trip_requests')
    .select('*')
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  const reqIds = trips.map(t => t.id);

  // Pull active slot rows so we can both count proposals and detect "mine"
  const { data: slots } = await supabase
    .from('trip_slots')
    .select('id, trip_request_id, guide_id, status, price, currency, price_type, price_period, message, accepted_at')
    .in('trip_request_id', reqIds)
    .neq('status', 'rejected');

  const countMap = {};
  const mineMap = {};
  (slots || []).forEach(s => {
    countMap[s.trip_request_id] = (countMap[s.trip_request_id] || 0) + 1;
    if (s.guide_id === guideId) mineMap[s.trip_request_id] = s;
  });

  // Traveler profile lookups
  const travelerIds = [...new Set(trips.map(t => t.user_id).filter(Boolean))];
  let profileMap = {};
  if (travelerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', travelerIds);
    profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  }

  return trips
    .map(trip => ({
      ...trip,
      accepted_count: countMap[trip.id] || 0,
      my_slot: mineMap[trip.id] || null,
      traveler: profileMap[trip.user_id] || null,
    }))
    // Hide fully-booked requests unless this guide is one of the applicants
    .filter(trip => trip.accepted_count < 5 || trip.my_slot);
}

// ── Tourist: fetch my trip requests + their guide slots ──────────────────────

export async function getMyTripRequests(userId) {
  const { data: trips, error } = await supabase
    .from('trip_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  const normalized = trips.map(t => ({
    ...t,
    title: t.destination ? `Trip to ${t.destination}` : 'Trip Request',
    travel_dates: t.start_date ? { start: t.start_date, end: t.end_date } : null,
    group_size: (t.adults || t.adult_count || 1) + (t.children || t.child_count || 0),
    status: t.status || 'pending',
    source: 'request',
  }));

  const tripIds = normalized.map(t => t.id);
  const { data: slots } = await supabase
    .from('trip_slots')
    .select('*')
    .in('trip_request_id', tripIds);

  if (!slots || slots.length === 0) {
    return normalized.map(t => ({ ...t, slots: [] }));
  }

  const guideIds = [...new Set(slots.map(s => s.guide_id))];
  const { data: guideProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, rating')
    .in('id', guideIds);

  const guideMap = Object.fromEntries((guideProfiles || []).map(p => [p.id, p]));

  const slotsByTrip = {};
  (slots || []).forEach(slot => {
    if (!slotsByTrip[slot.trip_request_id]) slotsByTrip[slot.trip_request_id] = [];
    slotsByTrip[slot.trip_request_id].push({
      ...slot,
      guide: guideMap[slot.guide_id] || null,
    });
  });

  return normalized.map(trip => ({
    ...trip,
    slots: slotsByTrip[trip.id] || [],
  }));
}

// ── Guide: fetch requests this guide already accepted ─────────────────────────

export async function fetchMyAcceptedRequests(guideId) {
  const { data: slots, error: sErr } = await supabase
    .from('trip_slots')
    .select('id, status, accepted_at, trip_request_id, price, currency, price_type, price_period, itinerary, included, excluded, message, images')
    .eq('guide_id', guideId);

  if (sErr) throw sErr;
  if (!slots?.length) return [];

  const reqIds = slots.map(s => s.trip_request_id);
  const { data: requests, error: rErr } = await supabase
    .from('trip_requests')
    .select('*')
    .in('id', reqIds);

  if (rErr) throw rErr;

  const reqMap = Object.fromEntries((requests || []).map(r => [r.id, r]));
  return slots.map(slot => ({ ...slot, request: reqMap[slot.trip_request_id] || null }));
}

// ── Guide: submit a full proposal for a trip request ─────────────────────────
// `proposal` shape: { price, currency, price_type, price_period, itinerary,
//   included[], excluded[], message, images[] }
// DB trigger (on_trip_slot_insert) handles proposals_ready + tourist notification.

export async function guideSubmitProposal(guideId, requestId, proposal) {
  // 1. Re-check the cap to avoid race conditions
  const { data: existing, error: countErr } = await supabase
    .from('trip_slots')
    .select('id', { count: 'exact', head: false })
    .eq('trip_request_id', requestId)
    .neq('status', 'rejected');
  if (countErr) throw countErr;
  if ((existing?.length ?? 0) >= 5) {
    throw new Error('This request is no longer accepting proposals.');
  }

  // 2. Check this guide hasn't already applied
  const { data: mine } = await supabase
    .from('trip_slots')
    .select('id, status')
    .eq('trip_request_id', requestId)
    .eq('guide_id', guideId)
    .maybeSingle();
  if (mine) {
    throw new Error('You have already submitted a proposal for this request.');
  }

  // 3. Insert the full proposal
  const { data, error } = await supabase
    .from('trip_slots')
    .insert({
      trip_request_id: requestId,
      guide_id: guideId,
      status: 'accepted',
      ...proposal,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * @deprecated Use guideSubmitProposal(guideId, requestId, proposal) instead.
 * Kept as a forwarder so any forgotten caller still works.
 */
export async function guideAcceptRequest(guideId, requestId) {
  return guideSubmitProposal(guideId, requestId, {});
}

// ── Guide: reject a slot; if all slots are rejected, re-broadcast the request ─

export async function rejectTripSlot(guideId, tripRequestId) {
  const { error: updateSlotError } = await supabase
    .from('trip_slots')
    .update({ status: 'rejected' })
    .eq('guide_id', guideId)
    .eq('trip_request_id', tripRequestId);

  if (updateSlotError) throw updateSlotError;

  // Check if all slots are now rejected → re-broadcast
  const { data: allSlots } = await supabase
    .from('trip_slots')
    .select('status')
    .eq('trip_request_id', tripRequestId);

  const allRejected = allSlots && allSlots.length > 0 && allSlots.every(s => s.status === 'rejected');
  if (allRejected) {
    await rebroadcastTripRequest(tripRequestId);
  }
}

// ── Guide: finalize a trip slot, mark the parent request completed ───────────

export async function finalizeTripSlot(guideId, tripRequestId) {
  const { error: slotError } = await supabase
    .from('trip_slots')
    .update({ status: 'finalized', finalized_at: new Date().toISOString() })
    .eq('guide_id', guideId)
    .eq('trip_request_id', tripRequestId);

  if (slotError) throw slotError;

  const { error: tripError } = await supabase
    .from('trip_requests')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', tripRequestId);

  if (tripError) throw tripError;
}

// ── Tourist: re-broadcast an expired or fully-rejected request ───────────────

export async function rebroadcastTripRequest(tripRequestId) {
  await supabase
    .from('trip_slots')
    .update({ status: 'rejected' })
    .eq('trip_request_id', tripRequestId);

  await supabase
    .from('trip_requests')
    .update({
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripRequestId);
}

// ── Tourist: select a guide from the 5 proposals ──────────────────────────────
// DB trigger (on_trip_request_confirmed) handles slot updates + guide notifications

export async function touristSelectGuide(requestId, selectedGuideId) {
  const { error } = await supabase
    .from('trip_requests')
    .update({ status: 'confirmed', selected_guide_id: selectedGuideId })
    .eq('id', requestId);

  if (error) throw error;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notifId) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
}
