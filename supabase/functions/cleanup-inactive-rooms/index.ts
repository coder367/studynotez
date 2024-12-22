import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get rooms with no activity in the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    
    // Get inactive rooms
    const { data: inactiveRooms, error: roomsError } = await supabase
      .from('study_rooms')
      .select('id')
      .is('deleted_at', null)
      .lt('updated_at', fourHoursAgo)

    if (roomsError) throw roomsError

    if (inactiveRooms && inactiveRooms.length > 0) {
      const roomIds = inactiveRooms.map(room => room.id)
      
      // Delete room participants
      const { error: participantsError } = await supabase
        .from('room_participants')
        .delete()
        .in('room_id', roomIds)

      if (participantsError) throw participantsError

      // Soft delete rooms
      const { error: deleteError } = await supabase
        .from('study_rooms')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', roomIds)

      if (deleteError) throw deleteError

      console.log(`Cleaned up ${inactiveRooms.length} inactive rooms`)
    }

    return new Response(
      JSON.stringify({ message: 'Cleanup completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error during cleanup:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})