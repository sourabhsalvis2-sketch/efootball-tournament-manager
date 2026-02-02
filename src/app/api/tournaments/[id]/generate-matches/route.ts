import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🛡️ SECURITY: Verify admin authentication
  const authResult = await verifyAdminSession(request)
  if (!authResult.authenticated) {
    return createUnauthorizedResponse(`Admin access required: ${authResult.error}`)
  }

  try {
    const resolvedParams = await params
    const tournamentId = parseInt(resolvedParams.id)
    
    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      )
    }

    const matches = await DatabaseService.generateMatches(tournamentId)
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Generate matches error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Need at least 2 players')) {
        return NextResponse.json(
          { error: 'Need at least 2 players to generate matches' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    )
  }
}
