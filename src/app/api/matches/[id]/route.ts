import { NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db"
import { verifyAdminSession, createUnauthorizedResponse } from "@/lib/auth"
import { tournamentCache } from "@/lib/cache"
import { clientCache } from "@/lib/clientCache"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ 1) Allow Telegram Bot Update using Secret Header
    const telegramSecretHeader = request.headers.get("x-telegram-update-secret")
    const isTelegramAuth =
      telegramSecretHeader &&
      telegramSecretHeader === process.env.TELEGRAM_UPDATE_SECRET

    // ✅ 2) If NOT Telegram Auth → Then enforce existing Admin Cookie Session
    if (!isTelegramAuth) {
      // 🛡️ SECURITY: Verify admin authentication (existing)
      const authResult = await verifyAdminSession(request)
      if (!authResult.authenticated) {
        return createUnauthorizedResponse(`Admin access required: ${authResult.error}`)
      }
    }

    // ✅ Parse matchId
    const resolvedParams = await params
    const matchId = parseInt(resolvedParams.id)

    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    }

    // ✅ Parse request body
    const { score1, score2 } = await request.json()

    if (
      typeof score1 !== "number" ||
      typeof score2 !== "number" ||
      score1 < 0 ||
      score2 < 0
    ) {
      return NextResponse.json(
        { error: "Valid scores (non-negative numbers) are required" },
        { status: 400 }
      )
    }

    // ✅ Update DB
    const result = await DatabaseService.updateMatchScore(matchId, score1, score2)
    
    // ✅ Invalidate server cache for the tournament
    if (result && result.tournament_id) {
      tournamentCache.invalidate(result.tournament_id)
      // Also invalidate all in-progress tournaments since standings might change
      tournamentCache.invalidateInProgress()
      
      // ✅ Invalidate client cache for the tournament and refresh tournaments list
      clientCache.invalidate('tournament_details', result.tournament_id.toString())
      clientCache.invalidate('tournaments_list')
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Update match score error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update match score" },
      { status: 500 }
    )
  }
}
