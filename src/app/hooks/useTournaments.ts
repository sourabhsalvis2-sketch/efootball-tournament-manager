import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/api'
import { tournamentCache } from '@/lib/cache'
import { clientCache } from '@/lib/clientCache'

export interface Tournament {
  id: number
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  type: 'round_robin' | 'group_and_knockout'
  third_place_playoff?: boolean
  players?: any[]
  matches?: any[]
}

export interface TournamentDetails {
  standings?: any[] | null
  winner?: any | null
  runnerUp?: any | null
  thirdPlace?: any | null
  loading?: boolean
  expanded?: boolean
  showAllMatches?: boolean
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [details, setDetails] = useState<Record<number, TournamentDetails>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [fetchingDetails, setFetchingDetails] = useState<Set<number>>(new Set())

  const loadTournaments = useCallback(async () => {
    try {
      // First, try to get tournaments list from client cache
      const cachedTournaments = clientCache.get<Tournament[]>('tournaments_list')
      
      if (cachedTournaments) {
        setTournaments(cachedTournaments)
        setLoadError(null)
        
        // Load details from cache for each tournament (skip in-progress)
        for (const tournament of cachedTournaments) {
          // Skip caching for in-progress tournaments - always fetch fresh
          if (tournament.status === 'in_progress') {
            fetchTournamentDetails(tournament.id, tournament)
            continue
          }
          
          const cachedDetails = clientCache.get<Record<string, any>>('tournament_details', tournament.id.toString(), tournament.status)
          if (cachedDetails) {
            setDetails(prev => ({
              ...prev,
              [tournament.id]: {
                ...(prev[tournament.id] || {}),
                ...cachedDetails,
                loading: false
              }
            }))
          } else {
            // Fetch details if not in client cache
            fetchTournamentDetails(tournament.id, tournament)
          }
        }
        return
      }
      
      // If not in client cache, fetch from server
      const response = await apiClient.get('/api/tournaments')
      if (Array.isArray(response.data)) {
        setTournaments(response.data)
        setLoadError(null)
        
        // Cache tournaments list in client storage
        clientCache.set('tournaments_list', response.data)
        
        // Fetch details for each tournament
        for (const tournament of response.data) {
          fetchTournamentDetails(tournament.id, tournament)
        }
      } else {
        console.error('Unexpected /api/tournaments response:', response.data)
        setTournaments([])
        setLoadError('Unexpected response from server')
      }
    } catch (error: any) {
      console.error('Failed to load tournaments', error)
      setTournaments([])
      setLoadError(error?.message || 'Network error')
    }
  }, [])

  const fetchTournamentDetails = useCallback(async (tournamentId: number, tournamentData?: Tournament) => {
    // Prevent concurrent fetches for the same tournament
    if (fetchingDetails.has(tournamentId)) return

    // Use passed tournament data or find in current tournaments state
    const tournament = tournamentData || tournaments.find(t => t.id === tournamentId)
    if (!tournament) return

    // Skip client cache for in-progress tournaments - always fetch fresh data
    if (tournament.status !== 'in_progress') {
      const cachedDetails = clientCache.get<Record<string, any>>('tournament_details', tournamentId.toString(), tournament.status)
      if (cachedDetails) {
        setDetails(prev => ({
          ...prev,
          [tournamentId]: {
            ...(prev[tournamentId] || {}),
            ...cachedDetails,
            loading: false
          }
        }))
        return
      }
    }

    // Check server cache for completed tournaments
    if (tournament.status === 'completed') {
      const cachedStandings = tournamentCache.get<any[] | null>(tournamentId, 'standings', tournament.status)
      const cachedWinner = tournamentCache.get<any | null>(tournamentId, 'winner', tournament.status)
      const cachedRunnerUp = tournamentCache.get<any | null>(tournamentId, 'runnerUp', tournament.status)
      const cachedThirdPlace = tournamentCache.get<any | null>(tournamentId, 'thirdPlace', tournament.status)

      // If all cached data exists, use it
      if (cachedStandings !== null && cachedWinner !== null && cachedRunnerUp !== null) {
        const detailsData = {
          standings: cachedStandings,
          winner: cachedWinner,
          runnerUp: cachedRunnerUp,
          thirdPlace: cachedThirdPlace,
          loading: false
        }
        
        // Store in client cache
        clientCache.set('tournament_details', detailsData, tournamentId.toString(), tournament.status)
        
        setDetails(prev => ({
          ...prev,
          [tournamentId]: {
            ...(prev[tournamentId] || {}),
            ...detailsData
          }
        }))
        return
      }
    }

    // For in-progress tournaments, always fetch fresh data (shorter cache time)
    // For pending tournaments, use cache if available
    if (tournament.status === 'pending') {
      const cachedStandings = tournamentCache.get<any[] | null>(tournamentId, 'standings', tournament.status)
      if (cachedStandings !== null) {
        const detailsData = {
          standings: cachedStandings,
          loading: false
        }
        
        // Store in client cache
        clientCache.set('tournament_details', detailsData, tournamentId.toString(), tournament.status)
        
        setDetails(prev => ({
          ...prev,
          [tournamentId]: {
            ...(prev[tournamentId] || {}),
            ...detailsData
          }
        }))
        return
      }
    }

    // Set loading state
    setFetchingDetails(prev => {
      const newSet = new Set(prev)
      newSet.add(tournamentId)
      return newSet
    })
    
    setDetails(prev => ({ 
      ...prev, 
      [tournamentId]: { 
        ...(prev[tournamentId] || {}), 
        loading: true 
      } 
    }))

    try {
      const requests = [
        apiClient.get(`/api/tournaments/${tournamentId}/standings`).then(r => r.data).catch(() => null)
      ]

      // Only fetch winner, runner-up, and third place for completed tournaments
      if (tournament.status === 'completed') {
        requests.push(
          apiClient.get(`/api/tournaments/${tournamentId}/winner`).then(r => r.data).catch(() => null),
          apiClient.get(`/api/tournaments/${tournamentId}/runner-up`).then(r => r.data).catch(() => null)
        )
        
        // Only fetch third place for tournaments with third place playoff enabled
        if (tournament.type === 'group_and_knockout' && tournament.third_place_playoff) {
          requests.push(
            apiClient.get(`/api/tournaments/${tournamentId}/third-place`).then(r => r.data).catch(() => null)
          )
        } else {
          requests.push(Promise.resolve(null)) // third place not applicable
        }
      } else {
        requests.push(
          Promise.resolve(null), // winner
          Promise.resolve(null), // runner-up
          Promise.resolve(null)  // third place
        )
      }

      const [standings, winner, runnerUp, thirdPlace] = await Promise.all(requests)
      
      // Cache the results in server cache
      tournamentCache.set(tournamentId, 'standings', standings, tournament.status)
      if (tournament.status === 'completed') {
        tournamentCache.set(tournamentId, 'winner', winner, tournament.status)
        tournamentCache.set(tournamentId, 'runnerUp', runnerUp, tournament.status)
        tournamentCache.set(tournamentId, 'thirdPlace', thirdPlace, tournament.status)
      }
      
      const detailsData = {
        standings,
        winner,
        runnerUp,
        thirdPlace,
        loading: false
      }
      
      // Store in client cache for instant future loads (skip in-progress)
      if (tournament.status !== 'in_progress') {
        clientCache.set('tournament_details', detailsData, tournamentId.toString(), tournament.status)
      }
      
      setDetails(prev => ({
        ...prev,
        [tournamentId]: {
          ...(prev[tournamentId] || {}), // Preserve existing state like expanded
          ...detailsData
        }
      }))
    } catch (error) {
      console.error(`Failed to fetch details for tournament ${tournamentId}:`, error)
      setDetails(prev => ({
        ...prev,
        [tournamentId]: {
          ...(prev[tournamentId] || {}), // Preserve existing state like expanded
          loading: false
        }
      }))
    } finally {
      setFetchingDetails(prev => {
        const newSet = new Set(prev)
        newSet.delete(tournamentId)
        return newSet
      })
    }
  }, [tournaments, fetchingDetails])

  const toggleExpanded = useCallback((tournamentId: number) => {
    setDetails(prev => ({
      ...prev,
      [tournamentId]: {
        ...(prev[tournamentId] || {}),
        expanded: !prev[tournamentId]?.expanded
      }
    }))
  }, [])

  const toggleShowAllMatches = useCallback((tournamentId: number) => {
    setDetails(prev => ({
      ...prev,
      [tournamentId]: {
        ...(prev[tournamentId] || {}),
        showAllMatches: !prev[tournamentId]?.showAllMatches
      }
    }))
  }, [])

  useEffect(() => {
    loadTournaments()
  }, [loadTournaments])

  return {
    tournaments,
    details,
    loadError,
    toggleExpanded,
    toggleShowAllMatches,
    refreshTournaments: loadTournaments
  }
}