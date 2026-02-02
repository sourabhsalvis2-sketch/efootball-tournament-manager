import React, { lazy, Suspense } from 'react'
import { Box, Typography, Card, CardContent, Grid, IconButton, Collapse, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import GroupIcon from '@mui/icons-material/Group'
import { Tournament, TournamentDetails } from '@/app/hooks/useTournaments'
import { getStatusIcon } from '@/app/utils/tournamentUtils'

// Lazy load heavy components
const ResultsSection = lazy(() => import('./ResultsSection').then(module => ({ default: module.ResultsSection })))
const StandingsTable = lazy(() => import('./StandingsTable').then(module => ({ default: module.StandingsTable })))
const MatchesList = lazy(() => import('./MatchesList').then(module => ({ default: module.MatchesList })))
import styles from '../page.module.css'

interface TournamentCardProps {
  tournament: Tournament
  details: TournamentDetails
  onToggleExpanded: (tournamentId: number) => void
  onToggleShowAllMatches: (tournamentId: number) => void
}

export function TournamentCard({ 
  tournament, 
  details, 
  onToggleExpanded, 
  onToggleShowAllMatches 
}: TournamentCardProps) {
  return (
    <Card className="tournament-card" elevation={6}>
      <CardContent>
        <Box className={styles.tournamentHeader}>
          {/* Left section - Tournament info */}
          <Box className={styles.tournamentInfo}>
            <Box className={styles.tournamentTitleSection}>
              <SportsSoccerIcon className={styles.soccerIconSmall} />
              <Typography variant="h5" className={styles.tournamentTitle}>
                {tournament.name}
              </Typography>
            </Box>
            <Box className={styles.tournamentStatusSection}>
              {getStatusIcon(tournament.status)}
              <Typography variant="body2" className={styles.statusText}>
                Status: <span style={{ color: '#00e5ff', fontWeight: 600 }}>{tournament.status.toUpperCase()}</span>
              </Typography>
            </Box>
          </Box>

          {/* Center section - Top 3 Results (hidden when expanded) */}
          {!details.expanded && (
            <Box className={styles.winnerSection}>
              <Suspense fallback={<CircularProgress size={20} />}>
                <ResultsSection 
                  details={details} 
                  tournamentStatus={tournament.status} 
                  isExpanded={false} 
                />
              </Suspense>
            </Box>
          )}

          {/* Right section - Players and Expand */}
          <Box sx={{
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexShrink: 0,
            order: { xs: 3, sm: 0 }
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ color: '#00e5ff', fontSize: { xs: 18, sm: 20 } }} />
              <Typography variant="h6" sx={{
                color: '#ffffff',
                fontSize: { xs: '0.875rem', sm: '1.25rem' }
              }}>
                Players
              </Typography>
              <Typography variant="h4" sx={{
                color: '#00e5ff',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}>
                {tournament.players?.length ?? 0}
              </Typography>
            </Box>
            <IconButton
              onClick={() => onToggleExpanded(tournament.id)}
              aria-label="expand"
              sx={{
                color: '#00e5ff',
                '&:hover': { backgroundColor: 'rgba(0,229,255,0.1)' }
              }}
            >
              <ExpandMoreIcon sx={{
                transform: details.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 300ms',
                fontSize: { xs: 24, sm: 28 }
              }} />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={!!details.expanded} timeout="auto">
          <Box sx={{ mt: 2 }}>
            {details.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={18} /> 
                <Typography sx={{ ml: 1 }}>Loading details...</Typography>
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Grid item xs={12} md={3}>
                  <Suspense fallback={<CircularProgress size={20} />}>
                    <ResultsSection 
                      details={details} 
                      tournamentStatus={tournament.status} 
                      isExpanded={true} 
                    />
                  </Suspense>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Suspense fallback={<CircularProgress size={20} />}>
                    <StandingsTable standings={details.standings || null} />
                  </Suspense>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Suspense fallback={<CircularProgress size={20} />}>
                    <MatchesList 
                      matches={tournament.matches || []}
                      players={tournament.players || []}
                      showAllMatches={!!details.showAllMatches}
                      onToggleShowAll={() => onToggleShowAllMatches(tournament.id)}
                    />
                  </Suspense>
                </Grid>
              </Grid>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}