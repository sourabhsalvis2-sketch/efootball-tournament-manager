import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  // 🛡️ SECURITY: Verify admin authentication
  const authResult = await verifyAdminSession(request)
  if (!authResult.authenticated) {
    return createUnauthorizedResponse(`Admin access required: ${authResult.error}`)
  }

  try {
    const { id, playerId } = await params
    const tournamentId = parseInt(id)
    const playerIdNum = parseInt(playerId)
    
    if (isNaN(tournamentId) || isNaN(playerIdNum)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID or player ID' },
        { status: 400 }
      )
    }

    // Check if tournament exists and is pending
    const tournament = await DatabaseService.getOne(
      'SELECT * FROM tournaments WHERE id = ?',
      [tournamentId]
    )

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only remove players from pending tournaments' },
        { status: 400 }
      )
    }

    // Check if player is in the tournament
    const playerInTournament = await DatabaseService.getOne(
      'SELECT * FROM tournament_players WHERE tournament_id = ? AND player_id = ?',
      [tournamentId, playerIdNum]
    )

    if (!playerInTournament) {
      return NextResponse.json(
        { error: 'Player not found in this tournament' },
        { status: 404 }
      )
    }

    await DatabaseService.removePlayerFromTournament(tournamentId, playerIdNum)
    
    return NextResponse.json({ message: 'Player removed from tournament successfully' })
  } catch (error) {
    console.error('Remove player from tournament error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove player from tournament' },
      { status: 500 }
    )
  }
}
