import { useState } from 'react'
import apiClient from '@/lib/api'

interface Player {
  id: number
  name: string
}

export function usePlayers() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [creatingPlayer, setCreatingPlayer] = useState(false)
  const [addPlayerLoading, setAddPlayerLoading] = useState(false)

  const loadPlayers = async () => {
    try {
      const response = await apiClient.get('/api/players')
      setAllPlayers(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to load players:', error)
      throw error
    }
  }

  const createPlayer = async (playerName: string) => {
    if (!playerName.trim()) {
      throw new Error('Enter a player name')
    }

    setCreatingPlayer(true)
    try {
      await apiClient.post('/api/players', { name: playerName })
      await loadPlayers()
    } finally {
      setCreatingPlayer(false)
    }
  }

  const addPlayerToTournament = async (playerId: number, tournamentId: number | null) => {
    if (!tournamentId) {
      throw new Error('Select a tournament')
    }

    setAddPlayerLoading(true)
    try {
      await apiClient.post(`/api/tournaments/${tournamentId}/players`, { playerId })
    } finally {
      setAddPlayerLoading(false)
    }
  }

  const addAllPlayersToTournament = async (tournamentId: number | null) => {
    if (!tournamentId) {
      throw new Error('Please select a tournament first')
    }
    if (allPlayers.length === 0) {
      throw new Error('No players available to add')
    }

    setAddPlayerLoading(true)
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/players/bulk`, {
        addAllPlayers: true
      })

      const result = response.data
      const { summary, results } = result

      // Create a detailed message
      let message = `Bulk operation completed:\n`
      message += `• Successfully added: ${summary.successful} players\n`

      if (summary.skipped > 0) {
        message += `• Already in tournament: ${summary.skipped} players\n`
      }

      if (summary.failed > 0) {
        message += `• Failed to add: ${summary.failed} players\n`
      }

      // Show detailed results if there are failures
      if (results.failed.length > 0) {
        message += `\nFailed players:\n`
        results.failed.forEach((failure: any) => {
          message += `• ${failure.playerName}: ${failure.error}\n`
        })
      }

      alert(message)
    } catch (error: any) {
      console.error('Error adding all players:', error)
      let errorMessage = 'Failed to add players to tournament'

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      throw new Error(errorMessage)
    } finally {
      setAddPlayerLoading(false)
    }
  }

  const removePlayerFromTournament = async (tournamentId: number, playerId: number, playerName: string) => {
    if (!confirm(`Are you sure you want to remove "${playerName}" from this tournament?`)) {
      return
    }

    try {
      await apiClient.delete(`/api/tournaments/${tournamentId}/players/${playerId}`)
    } catch (error) {
      console.error('Failed to remove player from tournament:', error)
      throw new Error('Failed to remove player from tournament')
    }
  }

  const getPlayerName = (tournament: any, playerId: number): string => {
    if (!tournament) return String(playerId)
    const player = (tournament.players || []).find((p: any) => p.id === playerId)
    return player ? player.name : String(playerId)
  }

  return {
    allPlayers,
    creatingPlayer,
    addPlayerLoading,
    loadPlayers,
    createPlayer,
    addPlayerToTournament,
    addAllPlayersToTournament,
    removePlayerFromTournament,
    getPlayerName
  }
}

export type { Player }