import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
    if (!DAILY_API_KEY) {
      throw new Error('Daily API key not configured')
    }

    const { roomName } = await req.json()
    if (!roomName) {
      throw new Error('Room name is required')
    }

    console.log('Creating Daily room:', roomName)

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: "cloud",
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Daily API error:', data)
      throw new Error('Failed to create Daily room')
    }

    console.log('Daily room created successfully:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})