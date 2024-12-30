import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const DAILY_API_URL = 'https://api.daily.co/v1'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request body
    let body;
    try {
      body = await req.json()
    } catch (e) {
      console.error('Error parsing request body:', e)
      throw new Error('Invalid request body')
    }

    const { roomName } = body
    
    if (!roomName) {
      console.error('Room name is missing')
      throw new Error('Room name is required')
    }

    if (!DAILY_API_KEY) {
      console.error('Daily API key is missing')
      throw new Error('Daily API key is not configured')
    }

    console.log(`Creating Daily.co room: ${roomName}`)

    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.round(Date.now() / 1000) + 3600 // Room expires in 1 hour
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Daily.co API error:', data)
      throw new Error(data.error || 'Failed to create Daily.co room')
    }

    console.log('Daily.co room created successfully:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error creating Daily.co room:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error instanceof Error ? error.stack : undefined 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})