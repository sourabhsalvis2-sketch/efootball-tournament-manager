"use client"

import React, { useMemo, useState } from "react"
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    Stack,
    TextField,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Button,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"
import { createPlayerLookup } from "@/app/utils/tournamentUtils"

interface Match {
    id: number
    player1_id: number
    player2_id: number
    score1?: number | null
    score2?: number | null
    round?: string | null // ✅ GROUP-A / GROUP-B
}

interface Player {
    id: number
    name: string
}

interface MatchesListEditableProps {
    tournament: any
    matches: Match[]
    players: Player[]
}

export function MatchesListEditable({ tournament, matches, players }: MatchesListEditableProps) {
    const playerLookup = createPlayerLookup(players)

    // ✅ Group Name comes from round
    const getGroupName = (match: Match) => String(match.round || "NO GROUP").toUpperCase()

    // ✅ Player names using lookup
    const getPlayer1Name = (match: Match) => playerLookup[match.player1_id] ?? match.player1_id
    const getPlayer2Name = (match: Match) => playerLookup[match.player2_id] ?? match.player2_id

    // ✅ Local score map only for copy purpose
    const [scoreMap, setScoreMap] = useState<Record<number, { s1: string; s2: string }>>({})

    // ✅ Copied message per match row
    const [copiedMatchId, setCopiedMatchId] = useState<number | null>(null)

    // ✅ Copied message for header button
    const [copiedPlayersMsg, setCopiedPlayersMsg] = useState(false)

    const updateScore = (matchId: number, field: "s1" | "s2", value: string) => {
        if (value !== "" && !/^\d+$/.test(value)) return

        setScoreMap((prev) => ({
            ...prev,
            [matchId]: {
                s1: prev[matchId]?.s1 ?? "",
                s2: prev[matchId]?.s2 ?? "",
                [field]: value,
            },
        }))
    }

    // ✅ Group matches
    const groupedMatches = useMemo(() => {
        return matches.reduce<Record<string, Match[]>>((acc, match) => {
            const groupKey = getGroupName(match)
            if (!acc[groupKey]) acc[groupKey] = []
            acc[groupKey].push(match)
            return acc
        }, {})
    }, [matches])

    // ✅ Group wise players (from matches)
    const groupWisePlayers = useMemo(() => {
        const groupMap: Record<string, Set<string>> = {}

        matches.forEach((m) => {
            const group = getGroupName(m)
            if (!groupMap[group]) groupMap[group] = new Set()

            groupMap[group].add(String(getPlayer1Name(m)))
            groupMap[group].add(String(getPlayer2Name(m)))
        })

        return groupMap
    }, [matches])

    // ✅ Score Text logic
    const getScoreText = (match: Match) => {
        const editedS1 = scoreMap[match.id]?.s1
        const editedS2 = scoreMap[match.id]?.s2

        if (editedS1 !== undefined && editedS1 !== "" && editedS2 !== undefined && editedS2 !== "") {
            return `${editedS1} : ${editedS2}`
        }

        return `${match.score1 ?? "-"} : ${match.score2 ?? "-"}`
    }

    // ✅ Copy one match
    const copyOneMatch = async (match: Match) => {
        const p1 = getPlayer1Name(match)
        const p2 = getPlayer2Name(match)
        const group = getGroupName(match)
        const scoreText = getScoreText(match)

        const textToCopy = `🏆 Tournament: ${tournament?.name}
Status: ${String(tournament?.status).toUpperCase()}

📌 ${group}
⚽ ${p1} vs ${p2}
🎯 Score: ${scoreText}
🆔 Match ID: ${match.id}`

        await navigator.clipboard.writeText(textToCopy)

        setCopiedMatchId(match.id)

        setTimeout(() => {
            setCopiedMatchId(null)
        }, 1500)
    }

    // ✅ Copy Group Wise Players
    const copyGroupWisePlayers = async () => {
        const lines: string[] = []

        lines.push(`🏆 Tournament: ${tournament?.name}`)
        lines.push(`Status: ${String(tournament?.status).toUpperCase()}`)
        lines.push(``)
        lines.push(`👥 Group Wise Players`)
        lines.push(`-----------------------------`)

        Object.entries(groupWisePlayers).forEach(([group, playersSet]) => {
            lines.push(`\n📌 ${group}`)

            const list = Array.from(playersSet)
            list.forEach((p, index) => {
                lines.push(`${index + 1}) ${p}`)
            })
        })

        await navigator.clipboard.writeText(lines.join("\n"))

        setCopiedPlayersMsg(true)
        setTimeout(() => setCopiedPlayersMsg(false), 1500)
    }

    return (
        <Card elevation={5}>
            <CardContent>
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Group Wise Matches
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {copiedPlayersMsg && (
                            <Typography sx={{ color: "#00e5ff", fontWeight: 700, fontSize: 13 }}>
                                Copied ✅
                            </Typography>
                        )}

                        <Button
                            onClick={copyGroupWisePlayers}
                            variant="outlined"
                            size="small"
                            sx={{
                                color: "#00e5ff",
                                borderColor: "#00e5ff",
                                fontWeight: 800,
                                "&:hover": {
                                    borderColor: "#00e5ff",
                                    backgroundColor: "rgba(0,229,255,0.08)",
                                },
                            }}
                        >
                            Copy Group Players
                        </Button>
                    </Box>
                </Box>

                {/* No matches */}
                {Object.keys(groupedMatches).length === 0 && <Typography>No matches available</Typography>}

                {/* Groups */}
                {Object.entries(groupedMatches).map(([group, mList]) => (
                    <Accordion key={group}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 800, color: "#00e5ff" }}>
                                {group} ({mList.length})
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Stack spacing={1.2}>
                                {mList.map((match) => {
                                    const p1 = getPlayer1Name(match)
                                    const p2 = getPlayer2Name(match)

                                    return (
                                        <Box
                                            key={match.id}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 2,
                                                p: 1.2,
                                                borderRadius: 2,
                                                backgroundColor: "rgba(0,229,255,0.06)",
                                                flexDirection: { xs: "column", sm: "row" },
                                                alignItems: { xs: "stretch", sm: "center" },
                                            }}
                                        >
                                            {/* Match info */}
                                            <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    <SportsSoccerIcon sx={{ fontSize: 16, color: "#00e5ff" }} />
                                                    {p1} vs {p2}
                                                </Typography>

                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Match ID: {match.id}
                                                </Typography>
                                            </Box>

                                            {/* Score inputs */}
                                            <Box
                                                sx={{
                                                    width: { xs: "100%", sm: 320 },
                                                    display: "flex",
                                                    justifyContent: { xs: "flex-start", sm: "center" },
                                                    alignItems: "center",
                                                    gap: 1.2,
                                                }}
                                            >
                                                <TextField
                                                    size="small"
                                                    label={String(p1)}
                                                    value={scoreMap[match.id]?.s1 ?? ""}
                                                    onChange={(e) => updateScore(match.id, "s1", e.target.value)}
                                                    sx={{ width: { xs: "45%", sm: 130 } }}
                                                    inputProps={{ style: { textAlign: "center" } }}
                                                />

                                                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>:</Typography>

                                                <TextField
                                                    size="small"
                                                    label={String(p2)}
                                                    value={scoreMap[match.id]?.s2 ?? ""}
                                                    onChange={(e) => updateScore(match.id, "s2", e.target.value)}
                                                    sx={{ width: { xs: "45%", sm: 130 } }}
                                                    inputProps={{ style: { textAlign: "center" } }}
                                                />
                                            </Box>

                                            {/* Copied text + Copy Button */}
                                            <Box
                                                sx={{
                                                    width: { xs: "100%", sm: "auto" },
                                                    display: "flex",
                                                    justifyContent: { xs: "flex-end", sm: "flex-end" },
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                {copiedMatchId === match.id && (
                                                    <Typography sx={{ color: "#00e5ff", fontWeight: 700, fontSize: 13 }}>
                                                        Copied ✅
                                                    </Typography>
                                                )}

                                                <Tooltip title="Copy match details">
                                                    <IconButton
                                                        onClick={() => copyOneMatch(match)}
                                                        sx={{
                                                            color: "#00e5ff",
                                                            "&:hover": { backgroundColor: "rgba(0,229,255,0.1)" },
                                                        }}
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    )
}
