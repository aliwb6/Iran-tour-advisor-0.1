import { supabase } from '../supabaseClient';

// ── Guide: fetch all open requests this guide hasn't accepted yet ─────────────

export async function fetchAvailableRequests(guideId) {
  const { data: mySlots } = await supabase
    .from('trip_slots')
    .select('trip_request_id')
    .eq('guide_id', guideId);

  const excludeIds = (mySlots || []).map(s => s.trip_request_id);

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

  // Attach slot counts so the guide can see how many have accepted
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

  return data.map(r => ({ ...r, accepted_count: countMap[r.id] || 0 }));
}

// ── Guide: fetch requests this guide already accepted ─────────────────────────

export async function fetchMyAcceptedRequests(guideId) {
  const { data: slots, error: sErr } = await supabase
    .from('trip_slots')
    .select('id, status, accepted_at, trip_request_id')
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

// ── Guide: accept a trip request (DB trigger handles proposals_ready + notify) ─

export async function guideAcceptRequest(guideId, requestId) {
  // Idempotency check
  const { data: existing } = await supabase
    .from('trip_slots')
    .select('id')
    .eq('trip_request_id', requestId)
    .eq('guide_id', guideId)
    .maybeSingle();

  if (existing) throw new Error('You have already accepted this request.');

  // Check whether request is still open
  const { count } = await supabase
    .from('trip_slots')
    .select('id', { count: 'exact', head: true })
    .eq('trip_request_id', requestId)
    .neq('status', 'rejected');

  if ((count || 0) >= 3) {
    throw new Error('This request already has 3 guides — it is no longer available.');
  }

  const { error } = await supabase
    .from('trip_slots')
    .insert({
      trip_request_id: requestId,
      guide_id: guideId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });

  if (error) throw error;
  // DB trigger (on_trip_slot_insert) handles marking proposals_ready + tourist notification
}

// ── Tourist: select a guide from the 3 proposals ──────────────────────────────
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
