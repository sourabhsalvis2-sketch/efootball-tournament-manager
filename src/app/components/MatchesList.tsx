import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import { separateMatches, getMatchStatusClass, createPlayerLookup } from '@/app/utils/tournamentUtils'

interface MatchesListProps {
  matches: any[]
  players: any[]
  showAllMatches: boolean
  onToggleShowAll: () => void
}

export function MatchesList({ matches, players, showAllMatches, onToggleShowAll }: MatchesListProps) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          ⚽ Matches
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0bec5' }}>No matches yet</Typography>
      </Box>
    )
  }

  const playerLookup = createPlayerLookup(players)
  const { mainMatches, otherMatches } = separateMatches(matches)

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        ⚽ Matches
      </Typography>
      
      <List dense>
        {mainMatches.map((match: any) => (
          <ListItem
            key={match.id}
            className={getMatchStatusClass(match)}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsSoccerIcon sx={{ fontSize: 16, color: '#00e5ff' }} />
                  {`${playerLookup[match.player1_id] ?? match.player1_id} vs ${playerLookup[match.player2_id] ?? match.player2_id} — ${match.score1 ?? '-'} : ${match.score2 ?? '-'}`}
                </Box>
              }
              secondary={`${match.round.toUpperCase()}`}
            />
          </ListItem>
        ))}
        
        {showAllMatches && otherMatches.map((match: any) => (
          <ListItem
            key={match.id}
            className={getMatchStatusClass(match)}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsSoccerIcon sx={{ fontSize: 16, color: '#00e5ff' }} />
                  {`${playerLookup[match.player1_id] ?? match.player1_id} vs ${playerLookup[match.player2_id] ?? match.player2_id} — ${match.score1 ?? '-'} : ${match.score2 ?? '-'}`}
                </Box>
              }
              secondary={`${match.round.toUpperCase()}`}
            />
          </ListItem>
        ))}
      </List>
      
      {otherMatches.length > 0 && (
        <Button
          size="small"
          variant="outlined"
          sx={{ mt: 1, color: '#00e5ff', borderColor: '#00e5ff' }}
          onClick={onToggleShowAll}
        >
          {showAllMatches ? 'Hide Group Matches' : 'Show All Matches'}
        </Button>
      )}
    </Box>
  )
}