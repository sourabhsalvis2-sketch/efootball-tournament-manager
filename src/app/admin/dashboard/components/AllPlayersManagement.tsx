import React from 'react'
import { Button, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material'
import { usePlayers } from '../hooks/usePlayers'
import { useDashboardForms } from '../hooks/useDashboardForms'

interface AllPlayersManagementProps {
  onPlayersUpdated: () => void
  selectedTournament: number | null
  allPlayers: any[]
  addPlayerLoading: boolean
}

export function AllPlayersManagement({ 
  onPlayersUpdated, 
  selectedTournament, 
  allPlayers, 
  addPlayerLoading 
}: AllPlayersManagementProps) {
  const players = usePlayers()
  const forms = useDashboardForms()

  const handleAddPlayerToTournament = async (playerId: number) => {
    await players.addPlayerToTournament(playerId, selectedTournament)
    onPlayersUpdated()
  }

  const handleAddAllPlayersToTournament = async () => {
    await players.addAllPlayersToTournament(selectedTournament)
    onPlayersUpdated()
  }

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={() => forms.setShowAllPlayers(!forms.showAllPlayers)} 
        sx={{ mt: 2 }}
      >
        {forms.showAllPlayers ? 'Hide All Players' : 'Show All Players'}
      </Button>
      
      {forms.showAllPlayers && (
        <Card className="dashboard-card" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" className="card-title">All Players</Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: '#b0bec5' }}>
              Select a tournament first, then click "Add to selected" to add players
            </Typography>
            
            {allPlayers.length > 0 && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddAllPlayersToTournament}
                disabled={addPlayerLoading || !selectedTournament}
                sx={{ mb: 2, backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
              >
                {addPlayerLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                Add all to selected tournament
              </Button>
            )}
            
            <Box className="players-list">
              {allPlayers.map((player: any) => (
                <Box key={player.id} className="player-item">
                  <span className="player-name">{player.name}</span>
                  <Button
                    size="small"
                    onClick={() => handleAddPlayerToTournament(player.id)}
                    disabled={addPlayerLoading || !selectedTournament}
                    className="player-action-button"
                    variant="outlined"
                  >
                    {addPlayerLoading ? <CircularProgress size={12} /> : 'Add to selected'}
                  </Button>
                </Box>
              ))}
              
              {allPlayers.length === 0 && (
                <Typography variant="body2" sx={{ color: '#b0bec5', fontStyle: 'italic' }}>
                  No players created yet
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  )
}