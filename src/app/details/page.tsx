"use client"

import React, { useMemo, useState } from "react"
import { Box, Typography, CircularProgress } from "@mui/material"
import { useTournaments } from "@/app/hooks/useTournaments"
import { MatchesListEditable } from "../components/MatchesListEditable"

export default function DetailsPage() {
  const { tournaments, loading } = useTournaments() as any
  const [showAllMatches, setShowAllMatches] = useState(false)

  const inProgressTournament = useMemo(() => {
    if (!tournaments?.length) return null

    return tournaments.find((t: any) => {
      const status = String(t.status || "").toLowerCase().trim()
      return status === "in_progress"
    })
  }, [tournaments])

  if (loading) {
    return (
      <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
        <CircularProgress size={18} />
        <Typography>Loading tournaments...</Typography>
      </Box>
    )
  }



  if (!inProgressTournament) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Loading...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Tournament Match Details
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {inProgressTournament.name} ({inProgressTournament.status})
      </Typography>

      <MatchesListEditable
        tournament={inProgressTournament}
        matches={inProgressTournament.matches || []}
        players={inProgressTournament.players || []}
      />
    </Box>
  )
}
