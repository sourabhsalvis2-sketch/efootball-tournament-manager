import { useState, useCallback } from 'react'
import { tournamentCache } from '@/lib/cache'

export function useCacheManagement() {
  const [cacheStats, setCacheStats] = useState(() => tournamentCache.getStats())

  const refreshStats = useCallback(() => {
    setCacheStats(tournamentCache.getStats())
  }, [])

  const clearAllCache = useCallback(() => {
    tournamentCache.clear()
    refreshStats()
  }, [refreshStats])

  const invalidateTournament = useCallback((tournamentId: number) => {
    tournamentCache.invalidate(tournamentId)
    refreshStats()
  }, [refreshStats])

  const invalidateInProgress = useCallback(() => {
    tournamentCache.invalidateInProgress()
    refreshStats()
  }, [refreshStats])

  return {
    cacheStats,
    refreshStats,
    clearAllCache,
    invalidateTournament,
    invalidateInProgress
  }
}
