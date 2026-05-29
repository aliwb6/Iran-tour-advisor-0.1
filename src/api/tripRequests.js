import { supabase } from '../supabaseClient';

export async function createTripRequest(travelerId, tripData) {
  const { data, error } = await supabase
    .from('trip_requests')
    .insert({
      traveler_id: travelerId,
      // destination is a text[] column — accept either a string or an array
      destination: Array.isArray(tripData.destination)
        ? tripData.destination
        : tripData.destination ? [tripData.destination] : [],
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

export async function getAvailableTripRequests(guideId) {
  // Find trip IDs this guide has already responded to (non-rejected)
  const { data: mySlots } = await supabase
    .from('trip_slots')
    .select('trip_request_id')
    .eq('guide_id', guideId)
    .neq('status', 'rejected');

  const excludeIds = (mySlots || []).map(s => s.trip_request_id);

  let query = supabase
    .from('trip_requests')
    .select('*')
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: trips, error } = await query;
  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  // Compute accepted slot counts from trip_slots (no slot_count column in DB)
  const reqIds = trips.map(t => t.id);
  const { data: slots } = await supabase
    .from('trip_slots')
    .select('trip_request_id')
    .in('trip_request_id', reqIds)
    .neq('status', 'rejected');

  const countMap = {};
  (slots || []).forEach(s => {
    countMap[s.trip_request_id] = (countMap[s.trip_request_id] || 0) + 1;
  });

  // Fetch traveler profiles
  const travelerIds = [...new Set(trips.map(t => t.user_id || t.traveler_id).filter(Boolean))];
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
      traveler: profileMap[trip.user_id || trip.traveler_id] || null,
    }))
    .filter(trip => trip.accepted_count < 3);
}

export async function getMyTripRequests(userId) {
  const { data: trips, error } = await supabase
    .from('trip_requests')
    .select('*')
    .or(`traveler_id.eq.${userId},user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  const normalized = trips.map(t => {
    // destination is text[]; guard against legacy string rows too
    const cities = Array.isArray(t.destination) ? t.destination : t.destination ? [t.destination] : [];
    return {
    ...t,
    destination: cities,
    title: cities.length ? `Trip to ${cities.join(', ')}` : 'Trip Request',
    travel_dates: t.start_date ? { start: t.start_date, end: t.end_date } : null,
    group_size: (t.adults || t.adult_count || 1) + (t.children || t.child_count || 0),
    status: t.status || 'pending',
    source: t.traveler_id ? undefined : 'request',
    };
  });

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

export async function acceptTripRequest(guideId, tripRequestId) {
  // Idempotency check
  const { data: existing } = await supabase
    .from('trip_slots')
    .select('id')
    .eq('trip_request_id', tripRequestId)
    .eq('guide_id', guideId)
    .maybeSingle();

  if (existing) throw new Error('You have already accepted this request.');

  // Check slot availability via trip_slots (no slot_count column in DB)
  const { count } = await supabase
    .from('trip_slots')
    .select('id', { count: 'exact', head: true })
    .eq('trip_request_id', tripRequestId)
    .neq('status', 'rejected');

  if ((count || 0) >= 3) {
    throw new Error('This request already has 3 guides — it is no longer available.');
  }

  const { error } = await supabase
    .from('trip_slots')
    .insert({
      trip_request_id: tripRequestId,
      guide_id: guideId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });

  if (error) throw error;
}

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
