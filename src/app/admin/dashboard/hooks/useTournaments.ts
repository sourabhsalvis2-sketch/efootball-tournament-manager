import { useState } from 'react'
import apiClient from '@/lib/api'
import { clientCache } from '@/lib/clientCache'

interface Tournament {
  id: number
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  type: 'round_robin' | 'group_and_knockout'
  teams_per_group?: number
  teams_advancing_per_group?: number
  allow_third_place_teams?: boolean
  third_place_playoff?: boolean
  players?: any[]
  matches?: any[]
}

interface TournamentFormData {
  name: string
  type: 'round_robin' | 'group_and_knockout'
  teamsPerGroup: number
  teamsAdvancing: number
  allowThirdPlace: boolean
  thirdPlacePlayoff: boolean
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [creatingTournament, setCreatingTournament] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)

  const loadTournaments = async () => {
    try {
      // First, try to get tournaments list from client cache
      const cachedTournaments = clientCache.get<Tournament[]>('tournaments_list')
      
      if (cachedTournaments) {
        setTournaments(cachedTournaments)
        
        // For admin dashboard, always fetch fresh data for in-progress tournaments
        const inProgressTournaments = cachedTournaments.filter(t => t.status === 'in_progress')
        if (inProgressTournaments.length > 0) {
          // Fetch fresh data from server to get latest in-progress tournament info
          const response = await apiClient.get('/api/tournaments')
          setTournaments(response.data)
          // Update cache with fresh data
          clientCache.set('tournaments_list', response.data)
        }
        
        return cachedTournaments
      }
      
      // If not in client cache, fetch from server
      const response = await apiClient.get('/api/tournaments')
      setTournaments(response.data)
      
      // Cache tournaments list in client storage
      clientCache.set('tournaments_list', response.data)
      
      return response.data
    } catch (error) {
      console.error('Failed to load tournaments:', error)
      throw error
    }
  }

  const createTournament = async (formData: TournamentFormData) => {
    if (!formData.name.trim()) {
      throw new Error('Enter a tournament name')
    }

    // Validate group + knockout settings
    if (formData.type === 'group_and_knockout') {
      if (formData.teamsPerGroup < 3 || formData.teamsPerGroup > 8) {
        throw new Error('Teams per group must be between 3 and 8')
      }
      if (formData.teamsAdvancing < 1 || formData.teamsAdvancing >= formData.teamsPerGroup) {
        throw new Error('Teams advancing must be less than teams per group')
      }
    }

    setCreatingTournament(true)
    try {
      const config = {
        name: formData.name,
        type: formData.type,
        teamsPerGroup: formData.teamsPerGroup,
        teamsAdvancingPerGroup: formData.teamsAdvancing,
        allowThirdPlaceTeams: formData.allowThirdPlace,
        thirdPlacePlayoff: formData.thirdPlacePlayoff
      }

      await apiClient.post('/api/tournaments', config)
      
      // Invalidate client cache after creating tournament
      clientCache.invalidate('tournaments_list')
      
      await loadTournaments()
    } finally {
      setCreatingTournament(false)
    }
  }

  const deleteTournament = async (tournamentId: number, tournamentName: string) => {
    if (!confirm(`Are you sure you want to delete "${tournamentName}"? This will permanently delete the tournament and all its matches.`)) {
      return
    }

    try {
      await apiClient.delete(`/api/tournaments/${tournamentId}`)
      
      // Invalidate client cache after deleting tournament
      clientCache.invalidate('tournaments_list')
      
      // If the deleted tournament was selected, clear the selection
      if (selectedTournament === tournamentId) {
        setSelectedTournament(null)
      }
      await loadTournaments()
    } catch (error) {
      console.error('Failed to delete tournament:', error)
      throw new Error('Failed to delete tournament')
    }
  }

  const generateMatches = async (tournamentId: number) => {
    setGenerateLoading(true)
    try {
      await apiClient.post(`/api/tournaments/${tournamentId}/generate-matches`)
      await loadTournaments()
    } finally {
      setGenerateLoading(false)
    }
  }

  const showStandings = async (tournamentId: number) => {
    const response = await apiClient.get(`/api/tournaments/${tournamentId}/standings`)
    alert(JSON.stringify(response.data, null, 2))
  }

  const showGroupStandings = async (tournamentId: number) => {
    try {
      const response = await apiClient.get(`/api/tournaments/${tournamentId}/groups`)

      let output = `Group Standings for Tournament: ${response.data.tournamentName}\n\n`

      response.data.groupStandings.forEach((group: any) => {
        output += `${group.groupName}:\n`
        output += `Pos | Player | P | W | D | L | GF | GA | GD | Pts\n`
        output += `----+--------+---+---+---+---+----+----+----+----\n`

        group.players.forEach((player: any, index: number) => {
          output += `${(index + 1).toString().padStart(3)} | ${player.name.padEnd(6)} | ${player.played} | ${player.wins} | ${player.draws} | ${player.losses} | ${player.goalsFor.toString().padStart(2)} | ${player.goalsAgainst.toString().padStart(2)} | ${(player.goalDiff >= 0 ? '+' : '') + player.goalDiff.toString().padStart(2)} | ${player.points.toString().padStart(2)}\n`
        })
        output += '\n'
      })

      alert(output)
    } catch (error) {
      alert('Failed to fetch group standings')
    }
  }

  const showKnockoutBracket = async (tournamentId: number) => {
    try {
      const response = await apiClient.get(`/api/tournaments/${tournamentId}/bracket`)

      let output = `Knockout Bracket for Tournament: ${response.data.tournamentName}\n\n`

      const rounds = ['round-of-16', 'quarter', 'semi', 'final', 'third-place']
      const roundNames = {
        'round-of-16': 'Round of 16',
        'quarter': 'Quarter Finals',
        'semi': 'Semi Finals',
        'final': 'Final',
        'third-place': 'Third Place Playoff'
      }

      rounds.forEach(round => {
        const matches = response.data.bracket[round]
        if (matches && matches.length > 0) {
          output += `${roundNames[round as keyof typeof roundNames]}:\n`
          matches.forEach((match: any, index: number) => {
            const p1Name = match.player1_name || 'TBD'
            const p2Name = match.player2_name || 'TBD'
            const score = match.status === 'completed'
              ? `${match.score1}-${match.score2}`
              : 'Not played'
            output += `  ${index + 1}. ${p1Name} vs ${p2Name} (${score})\n`
          })
          output += '\n'
        }
      })

      if (output.trim() === `Knockout Bracket for Tournament: ${response.data.tournamentName}`) {
        output += 'No knockout matches have been generated yet.\nComplete all group stage matches to generate the bracket.'
      }

      alert(output)
    } catch (error) {
      alert('Failed to fetch knockout bracket')
    }
  }

  return {
    tournaments,
    selectedTournament,
    creatingTournament,
    generateLoading,
    setSelectedTournament,
    loadTournaments,
    createTournament,
    deleteTournament,
    generateMatches,
    showStandings,
    showGroupStandings,
    showKnockoutBracket
  }
}

export type { Tournament, TournamentFormData }