import { supabase } from '../supabaseClient';

export async function createTripRequest(travelerId, tripData) {
  const { data, error } = await supabase
    .from('trip_requests')
    .insert({
      traveler_id: travelerId,
      title: tripData.title,
      destination: tripData.destination,
      travel_dates: tripData.dates || null,
      interests: tripData.interests || [],
      group_size: tripData.groupSize || 1,
      budget_range: tripData.budget || null,
      notes: tripData.notes || null,
      status: 'pending',
      slot_count: 0,
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
    .lt('slot_count', 3)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: trips, error } = await query;
  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  // Fetch traveler profiles
  const travelerIds = [...new Set(trips.map(t => t.traveler_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', travelerIds);

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  return trips.map(trip => ({
    ...trip,
    traveler: profileMap[trip.traveler_id] || null,
  }));
}

export async function getMyTripRequests(travelerId) {
  const { data: trips, error } = await supabase
    .from('trip_requests')
    .select('*')
    .eq('traveler_id', travelerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  // Fetch slots for all trips
  const tripIds = trips.map(t => t.id);
  const { data: slots } = await supabase
    .from('trip_slots')
    .select('*')
    .in('trip_request_id', tripIds);

  if (!slots || slots.length === 0) {
    return trips.map(t => ({ ...t, slots: [] }));
  }

  // Fetch guide profiles for slot owners
  const guideIds = [...new Set(slots.map(s => s.guide_id))];
  const { data: guideProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
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

  return trips.map(trip => ({
    ...trip,
    slots: slotsByTrip[trip.id] || [],
  }));
}

export async function acceptTripRequest(guideId, tripRequestId) {
  const { data: trip, error: fetchError } = await supabase
    .from('trip_requests')
    .select('slot_count, status')
    .eq('id', tripRequestId)
    .single();

  if (fetchError) throw fetchError;
  if (!trip) throw new Error('Trip request not found.');
  if (trip.slot_count >= 3) throw new Error('This trip request is already full.');

  const { error: slotError } = await supabase
    .from('trip_slots')
    .insert({ trip_request_id: tripRequestId, guide_id: guideId, status: 'chatting' });

  if (slotError) throw slotError;

  const newSlotCount = trip.slot_count + 1;

  const { error: updateError } = await supabase
    .from('trip_requests')
    .update({
      slot_count: newSlotCount,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripRequestId);

  if (updateError) throw updateError;

  return { success: true };
}

export async function rejectTripSlot(guideId, tripRequestId) {
  const { error: updateSlotError } = await supabase
    .from('trip_slots')
    .update({ status: 'rejected' })
    .eq('guide_id', guideId)
    .eq('trip_request_id', tripRequestId);

  if (updateSlotError) throw updateSlotError;

  // Decrement slot_count
  const { data: trip } = await supabase
    .from('trip_requests')
    .select('slot_count')
    .eq('id', tripRequestId)
    .single();

  const newSlotCount = Math.max(0, (trip?.slot_count || 1) - 1);

  await supabase
    .from('trip_requests')
    .update({ slot_count: newSlotCount, updated_at: new Date().toISOString() })
    .eq('id', tripRequestId);

  // Check if all slots are now rejected
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

  const { data: trip } = await supabase
    .from('trip_requests')
    .select('broadcast_count')
    .eq('id', tripRequestId)
    .single();

  await supabase
    .from('trip_requests')
    .update({
      slot_count: 0,
      status: 'pending',
      broadcast_count: (trip?.broadcast_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripRequestId);
}
