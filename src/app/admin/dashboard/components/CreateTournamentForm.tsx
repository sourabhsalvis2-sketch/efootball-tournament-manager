import React from 'react'
import { Button, Card, CardContent, Typography, TextField, Box, CircularProgress } from '@mui/material'
import { useTournaments } from '../hooks/useTournaments'
import { useDashboardForms } from '../hooks/useDashboardForms'

interface CreateTournamentFormProps {
  onTournamentCreated: () => void
}

export function CreateTournamentForm({ onTournamentCreated }: CreateTournamentFormProps) {
  const tournaments = useTournaments()
  const forms = useDashboardForms()

  const handleCreateTournament = async () => {
    const formData = forms.getTournamentFormData()
    await tournaments.createTournament(formData)
    forms.resetTournamentForm()
    onTournamentCreated()
  }

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={() => forms.setShowCreateTournament(!forms.showCreateTournament)} 
        sx={{ mt: 2 }}
      >
        {forms.showCreateTournament ? 'Hide Create Tournament' : 'Show Create Tournament'}
      </Button>
      
      {forms.showCreateTournament && (
        <Card className="dashboard-card">
          <CardContent>
            <Typography variant="h6" className="card-title">Create Tournament</Typography>
            
            <TextField
              fullWidth
              label="Tournament name"
              value={forms.name}
              onChange={e => forms.setName(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
              className="dashboard-input"
            />

            <Typography variant="subtitle2" sx={{ mb: 1, color: '#b0bec5' }}>
              Tournament Type
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant={forms.tournamentType === 'round_robin' ? "contained" : "outlined"}
                onClick={() => {
                  forms.setTournamentType('round_robin')
                  forms.setThirdPlacePlayoff(false)
                }}
                sx={{ mr: 1, mb: 1 }}
                size="small"
              >
                Round Robin
              </Button>
              <Button
                variant={forms.tournamentType === 'group_and_knockout' ? "contained" : "outlined"}
                onClick={() => {
                  forms.setTournamentType('group_and_knockout')
                  forms.setThirdPlacePlayoff(true)
                }}
                size="small"
                sx={{ mb: 1 }}
              >
                Group + Knockout
              </Button>
            </Box>

            {forms.tournamentType === 'group_and_knockout' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Teams per group"
                  type="number"
                  value={forms.teamsPerGroup}
                  onChange={e => forms.setTeamsPerGroup(Number(e.target.value))}
                  inputProps={{ min: 3, max: 8 }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Teams advancing per group"
                  type="number"
                  value={forms.teamsAdvancing}
                  onChange={e => forms.setTeamsAdvancing(Number(e.target.value))}
                  inputProps={{ min: 1, max: forms.teamsPerGroup - 1 }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant={forms.allowThirdPlace ? "contained" : "outlined"}
                    onClick={() => forms.setAllowThirdPlace(!forms.allowThirdPlace)}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Allow 3rd place teams: {forms.allowThirdPlace ? 'Yes' : 'No'}
                  </Button>
                  <Button
                    variant={forms.thirdPlacePlayoff ? "contained" : "outlined"}
                    onClick={() => forms.setThirdPlacePlayoff(!forms.thirdPlacePlayoff)}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    3rd place playoff: {forms.thirdPlacePlayoff ? 'Yes' : 'No'}
                  </Button>
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleCreateTournament}
              className="dashboard-button"
              disabled={tournaments.creatingTournament}
            >
              {tournaments.creatingTournament ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}