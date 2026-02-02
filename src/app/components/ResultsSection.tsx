import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { TournamentDetails } from '@/app/hooks/useTournaments'

interface ResultsSectionProps {
  details: TournamentDetails
  tournamentStatus: string
  isExpanded?: boolean
}

export function ResultsSection({ details, tournamentStatus, isExpanded = false }: ResultsSectionProps) {
  if (isExpanded) {
    // Expanded view with chips
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          🏆 Results
        </Typography>
        <Box className="winner-box">
          {details.winner ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🏆</span>
                <Chip label={details.winner.name} color="success" sx={{ fontWeight: 600, fontSize: '0.9rem' }} />
              </Box>
              {details.runnerUp && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🥈</span>
                  <Chip label={details.runnerUp.name} variant="outlined" sx={{ fontWeight: 500, fontSize: '0.85rem', borderColor: '#c0c0c0', color: '#c0c0c0' }} />
                </Box>
              )}
              {details.thirdPlace && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🥉</span>
                  <Chip label={details.thirdPlace.name} variant="outlined" sx={{ fontWeight: 500, fontSize: '0.85rem', borderColor: '#cd7f32', color: '#cd7f32' }} />
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ color: '#b0bec5' }}>TBD</Typography>
          )}
        </Box>
      </Box>
    )
  }

  // Collapsed view - shown in tournament header
  return (
    <Box>
      {details.winner ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EmojiEventsIcon sx={{ color: '#ffd700', fontSize: 20 }} />
            <Typography variant="h6" sx={{ color: '#ffd700', fontSize: '1rem', fontWeight: 600 }}>
              Results
            </Typography>
          </Box>
          
          {/* Winner */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#ffd700' }}>
              {details.winner.name}
            </Typography>
          </Box>
          
          {/* Runner-up */}
          {details.runnerUp && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <span style={{ fontSize: '1.1rem' }}>🥈</span>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#c0c0c0' }}>
                {details.runnerUp.name}
              </Typography>
            </Box>
          )}
          
          {/* Third place */}
          {details.thirdPlace && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: '1.1rem' }}>🥉</span>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#cd7f32' }}>
                {details.thirdPlace.name}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          <EmojiEventsIcon sx={{ color: '#666', fontSize: 24, mb: 0.5 }} />
          <Typography variant="body1" sx={{ color: '#b0bec5' }}>
            {tournamentStatus === 'completed' ? 'No Winner' : 'Tournament in Progress'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}