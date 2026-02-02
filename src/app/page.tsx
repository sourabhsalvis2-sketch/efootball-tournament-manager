'use client'

import React from 'react'
import { Typography, Box } from '@mui/material'
import { useTournaments } from './hooks/useTournaments'
import { TournamentCard } from './components/TournamentCard'
import styles from './page.module.css'

export default function Home() {
  const { 
    tournaments, 
    details, 
    loadError, 
    toggleExpanded, 
    toggleShowAllMatches 
  } = useTournaments()

  return (
    <div>
      <Box className={styles.pageHeader}>
        <Typography variant="h3" className={styles.mainTitle}>
          ⚽ eFootball Gadhinglaj
        </Typography>
      </Box>
      
      {loadError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {loadError}
        </Typography>
      )}
      
      <Box className="tournaments-list">
        {tournaments.length === 0 && !loadError && (
          <Typography>No tournaments yet</Typography>
        )}
        
        {tournaments.map(tournament => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            details={details[tournament.id] || {}}
            onToggleExpanded={toggleExpanded}
            onToggleShowAllMatches={toggleShowAllMatches}
          />
        ))}
      </Box>
    </div>
  )
}