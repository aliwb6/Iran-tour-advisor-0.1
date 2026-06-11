import { supabase } from '../supabaseClient';

// ── Guide: fetch all open requests this guide hasn't applied to yet ───────────

export async function fetchAvailableRequests(guideId) {
  // Find all slots for this guide (to know which they applied to + their slot data)
  const { data: mySlots } = await supabase
    .from('trip_slots')
    .select('trip_request_id, id, status, price, price_type, price_period, accepted_at')
    .eq('guide_id', guideId);

  const mySlotMap = {};
  (mySlots || []).forEach(s => { mySlotMap[s.trip_request_id] = s; });
  const excludeIds = Object.keys(mySlotMap);

  let query = supabase
    .from('trip_requests')
    .select('*')
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  // Attach slot counts
  const reqIds = data.map(r => r.id);
  const { data: slots } = await supabase
    .from('trip_slots')
    .select('trip_request_id')
    .in('trip_request_id', reqIds)
    .neq('status', 'rejected');

  const countMap = {};
  (slots || []).forEach(s => {
    countMap[s.trip_request_id] = (countMap[s.trip_request_id] || 0) + 1;
  });

  return data
    .map(r => ({
      ...r,
      accepted_count: countMap[r.id] || 0,
      my_slot: mySlotMap[r.id] || null,
    }))
    .filter(r => r.accepted_count < 5);
}

// ── Guide: fetch requests this guide already submitted proposals for ───────────

export async function fetchMyAcceptedRequests(guideId) {
  const { data: slots, error: sErr } = await supabase
    .from('trip_slots')
    .select('id, status, accepted_at, finalized_at, trip_request_id, price, currency, price_type, price_period, itinerary, message')
    .eq('guide_id', guideId)
    .order('accepted_at', { ascending: false });

  if (sErr) throw sErr;
  if (!slots?.length) return [];

  const reqIds = slots.map(s => s.trip_request_id);
  const { data: requests, error: rErr } = await supabase
    .from('trip_requests')
    .select('id, destination, start_date, end_date, adults, children, status')
    .in('id', reqIds);

  if (rErr) throw rErr;

  const reqMap = Object.fromEntries((requests || []).map(r => [r.id, r]));
  return slots.map(slot => ({ ...slot, request: reqMap[slot.trip_request_id] || null }));
}

// ── Guide: submit a full proposal ────────────────────────────────────────────

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
      accepted_at: new Date().toISOString(),
      ...proposal,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Tourist: select a guide from the proposals ────────────────────────────────
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
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notifId) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
}
