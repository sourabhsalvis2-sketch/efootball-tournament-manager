import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function verifyAdminSession(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-session')

    if (!sessionCookie) {
      return { authenticated: false, error: 'No session found' }
    }

    // Decode and validate session token
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString()
      const [username, timestamp] = decoded.split(':')
      
      // Check if session is still valid (24 hours)
      const sessionTime = parseInt(timestamp)
      const now = Date.now()
      const maxAge = 60 * 60 * 24 * 1000 // 24 hours in milliseconds
      
      if (now - sessionTime > maxAge) {
        return { authenticated: false, error: 'Session expired' }
      }

      // Validate username matches environment
      if (username !== process.env.ADMIN_USERNAME) {
        return { authenticated: false, error: 'Invalid session' }
      }

      return { authenticated: true, username }
    } catch (decodeError) {
      return { authenticated: false, error: 'Invalid session format' }
    }
  } catch (error) {
    return { authenticated: false, error: 'Session verification failed' }
  }
}

export function createUnauthorizedResponse(message: string = 'Unauthorized access') {
  return Response.json(
    { error: message },
    { 
      status: 401,
      headers: {
        'WWW-Authenticate': 'Session'
      }
    }
  )
}