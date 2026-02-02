import React from 'react'
import { Button, Card, CardContent, Typography, TextField, CircularProgress } from '@mui/material'
import { usePlayers } from '../hooks/usePlayers'
import { useDashboardForms } from '../hooks/useDashboardForms'

interface CreatePlayerFormProps {
  onPlayerCreated: () => void
}

export function CreatePlayerForm({ onPlayerCreated }: CreatePlayerFormProps) {
  const players = usePlayers()
  const forms = useDashboardForms()

  const handleCreatePlayer = async () => {
    await players.createPlayer(forms.playerName)
    forms.resetPlayerForm()
    onPlayerCreated()
  }

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={() => forms.setShowCreatePlayer(!forms.showCreatePlayer)} 
        sx={{ mt: 2 }}
      >
        {forms.showCreatePlayer ? 'Hide Create Player' : 'Show Create Player'}
      </Button>
      
      {forms.showCreatePlayer && (
        <Card className="dashboard-card" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" className="card-title">Create Player</Typography>
            
            <TextField
              fullWidth
              label="Player name"
              value={forms.playerName}
              onChange={e => forms.setPlayerName(e.target.value)}
              sx={{ mt: 1 }}
              className="dashboard-input"
            />
            
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={handleCreatePlayer}
              className="dashboard-button"
              disabled={players.creatingPlayer}
            >
              {players.creatingPlayer ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              Create
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}