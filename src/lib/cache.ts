// Tournament Caching System
interface CacheEntry<T> {
  data: T
  timestamp: number
  status: 'pending' | 'in_progress' | 'completed'
}

class TournamentCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly CACHE_DURATION = {
    completed: 30 * 60 * 1000, // 30 minutes for completed tournaments
    in_progress: 2 * 60 * 1000, // 2 minutes for in-progress tournaments
    pending: 10 * 60 * 1000, // 10 minutes for pending tournaments
  }

  // Generate cache key
  private getKey(tournamentId: number, type: string): string {
    return `tournament_${tournamentId}_${type}`
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now()
    const duration = this.CACHE_DURATION[entry.status] || this.CACHE_DURATION.pending
    return (now - entry.timestamp) < duration
  }

  // Get cached data
  get<T>(tournamentId: number, type: string, status: string): T | null {
    const key = this.getKey(tournamentId, type)
    const entry = this.cache.get(key)
    
    if (!entry || !this.isValid(entry)) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  // Set cached data
  set<T>(tournamentId: number, type: string, data: T, status: string): void {
    const key = this.getKey(tournamentId, type)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      status: status as 'pending' | 'in_progress' | 'completed'
    })
  }

  // Invalidate specific tournament cache
  invalidate(tournamentId: number): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(`tournament_${tournamentId}_`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Invalidate all in-progress tournaments (called when scores are updated)
  invalidateInProgress(): void {
    const keysToDelete: string[] = []
    this.cache.forEach((entry, key) => {
      if (entry.status === 'in_progress') {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache stats for debugging
  getStats(): { total: number; byStatus: Record<string, number> } {
    const byStatus: Record<string, number> = { pending: 0, in_progress: 0, completed: 0 }
    let total = 0
    
    this.cache.forEach((entry) => {
      total++
      byStatus[entry.status]++
    })
    
    return { total, byStatus }
  }
}

// Singleton instance
export const tournamentCache = new TournamentCache()

// Export types for use in components
export type { CacheEntry }
