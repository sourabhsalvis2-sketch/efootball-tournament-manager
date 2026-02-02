import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress } from '@mui/material'

interface ScoreDialogProps {
  open: boolean
  currentMatch: any
  currentTournament: any
  dialogScore1: string
  dialogScore2: string
  submitScoreLoading: boolean
  onClose: () => void
  onSubmitScore: () => Promise<void>
  onScore1Change: (value: string) => void
  onScore2Change: (value: string) => void
  getPlayerName: (tournament: any, playerId: number) => string
}

export function ScoreDialog({ 
  open,
  currentMatch,
  currentTournament,
  dialogScore1,
  dialogScore2,
  submitScoreLoading,
  onClose,
  onSubmitScore,
  onScore1Change,
  onScore2Change,
  getPlayerName
}: ScoreDialogProps) {
  const handleSubmit = async () => {
    try {
      await onSubmitScore()
    } catch (error) {
      console.error('ScoreDialog: Failed to submit score:', error)
      alert(error instanceof Error ? error.message : 'Failed to update score')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="score-dialog">
      <DialogTitle className="dialog-title">Enter Match Score</DialogTitle>
      <DialogContent className="dialog-content">
        <Typography sx={{ mb: 1 }} className="match-info">
          {currentMatch ? 
            `${getPlayerName(currentTournament, currentMatch.player1_id)} vs ${getPlayerName(currentTournament, currentMatch.player2_id)}` : ''
          }
        </Typography>
        <TextField
          label="Score 1"
          value={dialogScore1}
          onChange={e => onScore1Change(e.target.value)}
          sx={{ mr: 1 }}
          className="score-input"
        />
        <TextField
          label="Score 2"
          value={dialogScore2}
          onChange={e => onScore2Change(e.target.value)}
          className="score-input"
        />
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} className="dialog-cancel-button">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="dialog-submit-button"
          disabled={submitScoreLoading}
        >
          {submitScoreLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
