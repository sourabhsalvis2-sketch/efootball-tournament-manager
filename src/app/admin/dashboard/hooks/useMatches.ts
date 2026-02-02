import { useState } from 'react'
import apiClient from '@/lib/api'

interface Match {
  id: number
  tournament_id: number
  player1_id: number
  player2_id: number
  score1: number | null
  score2: number | null
  round: string
  status: 'scheduled' | 'completed'
  group_letter?: string
  stage: 'group' | 'knockout'
}

interface MatchCategory {
  inProgress: Match[]
  completed: Match[]
}

export function useMatches() {
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [dialogScore1, setDialogScore1] = useState<string>('')
  const [dialogScore2, setDialogScore2] = useState<string>('')
  const [submitScoreLoading, setSubmitScoreLoading] = useState(false)

  const categorizeMatches = (matches: Match[], tournamentType: string): Record<string, MatchCategory> => {
    if (!matches || matches.length === 0) return {}

    const categories: Record<string, MatchCategory> = {}

    matches.forEach(match => {
      const isCompleted = match.status === 'completed'
      const statusKey = isCompleted ? 'completed' : 'inProgress'
      
      let categoryKey: string
      
      if (tournamentType === 'group_and_knockout') {
        // For group matches, use the group letter
        if (match.stage === 'group' || match.round === 'group') {
          categoryKey = `Group ${match.group_letter || 'Unknown'}`
        } else {
          // For knockout rounds, use the round name
          const roundNames: Record<string, string> = {
            'round-of-16': 'Round of 16',
            'quarter': 'Quarterfinals',
            'semi': 'Semifinals',
            'final': 'Final',
            'third-place': 'Third Place Playoff'
          }
          categoryKey = roundNames[match.round] || match.round
        }
      } else {
        // Round robin - just categorize by status
        categoryKey = 'Round Robin'
      }

      if (!categories[categoryKey]) {
        categories[categoryKey] = { inProgress: [], completed: [] }
      }
      
      categories[categoryKey][statusKey].push(match)
    })

    // Sort matches within each category by ID for consistency
    Object.values(categories).forEach(category => {
      category.inProgress.sort((a, b) => a.id - b.id)
      category.completed.sort((a, b) => a.id - b.id)
    })

    return categories
  }

  const getCategoryDisplayOrder = (tournamentType: string): string[] => {
    if (tournamentType === 'group_and_knockout') {
      return [
        'Final',
        'Third Place Playoff', 
        'Semifinals',
        'Quarterfinals',
        'Round of 16',
        // Groups will be added dynamically and sorted alphabetically
      ]
    } else {
      return ['Round Robin']
    }
  }

  const shouldExpandSection = (categoryName: string, status: 'inProgress' | 'completed', hasMatches: boolean): boolean => {
    // Never expand completed sections by default
    if (status === 'completed') return false
    
    // Never expand if no matches
    if (!hasMatches) return false
    
    // Only expand knockout rounds with pending matches
    const knockoutRounds = ['Final', 'Third Place Playoff', 'Semifinals', 'Quarterfinals', 'Round of 16']
    return knockoutRounds.includes(categoryName)
  }

  const openScoreDialog = (matchId: number, tournaments: any[], selectedTournament: number | null) => {
    // Find match object so we can show player names
    const tournament = tournaments.find(x => x.id === selectedTournament) || 
                     tournaments.find(tr => tr.matches?.some((m: any) => m.id === matchId))
    const match = tournament?.matches?.find((m: any) => m.id === matchId) || null
    
    setCurrentMatch(match)
    setDialogScore1(match?.score1 != null ? String(match.score1) : '')
    setDialogScore2(match?.score2 != null ? String(match.score2) : '')
    setScoreDialogOpen(true)
  }

  const submitScore = async (onSuccess?: () => void) => {
    if (!currentMatch) return

    const s1 = Number(dialogScore1)
    const s2 = Number(dialogScore2)
    
    if (dialogScore1.trim() === '' || dialogScore2.trim() === '' || Number.isNaN(s1) || Number.isNaN(s2)) {
      throw new Error('Enter valid numeric scores')
    }

    setSubmitScoreLoading(true)
    try {
      const response = await apiClient.put(`/api/matches/${currentMatch.id}`, { score1: s1, score2: s2 })
      
      // If backend returned a winner immediately, show a quick alert
      if (response?.data?.winner) {
        alert(`Winner: ${response.data.winner.name}`)
      }
      
      closeScoreDialog()
      onSuccess?.()
    } finally {
      setSubmitScoreLoading(false)
    }
  }

  const closeScoreDialog = () => {
    setScoreDialogOpen(false)
    setCurrentMatch(null)
    setDialogScore1('')
    setDialogScore2('')
  }

  // Helper function to get player name from tournament data
  const getPlayerName = (tournament: any, playerId: number): string => {
    if (!tournament) return String(playerId)
    const player = (tournament.players || []).find((p: any) => p.id === playerId)
    return player ? player.name : String(playerId)
  }

  return {
    // Dialog state
    scoreDialogOpen,
    currentMatch,
    dialogScore1,
    dialogScore2,
    submitScoreLoading,
    setDialogScore1,
    setDialogScore2,
    
    // Methods
    categorizeMatches,
    getCategoryDisplayOrder,
    shouldExpandSection,
    getPlayerName,
    openScoreDialog,
    submitScore,
    closeScoreDialog
  }
}

export type { Match, MatchCategory }