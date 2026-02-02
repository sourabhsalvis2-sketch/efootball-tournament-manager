import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!
const TELEGRAM_UPDATE_SECRET = process.env.TELEGRAM_UPDATE_SECRET!
const APP_BASE_URL = process.env.APP_BASE_URL!

function extractMatchData(text: string) {
    const scoreMatch = text.match(/Score:\s*(\d+)\s*:\s*(\d+)/i)
    const matchIdMatch = text.match(/Match ID:\s*(\d+)/i)

    if (!scoreMatch || !matchIdMatch) return null

    return {
        matchId: Number(matchIdMatch[1]),
        score1: Number(scoreMatch[1]),
        score2: Number(scoreMatch[2]),
    }
}

async function sendTelegramMessage(chatId: number, message: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
    })
}

export async function POST(req: Request) {
    // ✅ Validate request is from Telegram webhook
    const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token")
    if (incomingSecret !== TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const chatId = body?.message?.chat?.id
    const text = body?.message?.text?.trim()

    if (!chatId || !text) return NextResponse.json({ ok: true })

    // ✅ Extract match + scores from pasted text
    const data = extractMatchData(text)

    if (!data) {
        await sendTelegramMessage(
            chatId,
            "❌ Please send data in proper format"
        )
        return NextResponse.json({ ok: true })
    }

    try {
        // ✅ Call your existing API route (PUT /api/matches/[id])
        const apiRes = await fetch(`${APP_BASE_URL}/api/matches/${data.matchId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-telegram-update-secret": TELEGRAM_UPDATE_SECRET,
            },
            body: JSON.stringify({
                score1: data.score1,
                score2: data.score2,
            }),
        })

        if (!apiRes.ok) {
            const errText = await apiRes.text()
            await sendTelegramMessage(
                chatId,
                `❌ Failed to update score.`
            )
            return NextResponse.json({ ok: false })
        }

        await sendTelegramMessage(
            chatId,
            `✅ Score updated successfully!\nMatch ID: ${data.matchId}\nScore: ${data.score1} : ${data.score2}`
        )

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        await sendTelegramMessage(chatId, `❌ Server error: ${err.message}`)
        return NextResponse.json({ ok: false })
    }
}
