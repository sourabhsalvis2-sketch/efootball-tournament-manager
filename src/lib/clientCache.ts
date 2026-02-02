// Client-side browser caching using localStorage
interface ClientCacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

class ClientCache {
  private readonly CACHE_VERSION = '1.0.0'
  private readonly CACHE_PREFIX = 'efootball_'
  
  // Cache duration based on tournament status
  private readonly CACHE_DURATION = {
    completed: 60 * 60 * 1000, // 1 hour for completed tournaments
    in_progress: 5 * 60 * 1000, // 5 minutes for in-progress tournaments
    pending: 30 * 60 * 1000, // 30 minutes for pending tournaments
    tournaments_list: 10 * 60 * 1000 // 10 minutes for tournaments list
  }

  // Generate cache key
  private getKey(type: string, id?: string | number): string {
    return `${this.CACHE_PREFIX}${type}${id ? `_${id}` : ''}`
  }

  // Check if cache entry is valid
  private isValid(entry: ClientCacheEntry<any>, duration: number): boolean {
    // Check version compatibility
    if (entry.version !== this.CACHE_VERSION) {
      return false
    }
    
    // Check expiration
    return (Date.now() - entry.timestamp) < duration
  }

  // Get cached data
  get<T>(type: string, id?: string | number, status?: string): T | null {
    try {
      const key = this.getKey(type, id)
      const item = localStorage.getItem(key)
      
      if (!item) return null
      
      const entry: ClientCacheEntry<T> = JSON.parse(item)
      
      // Determine cache duration based on type and status
      let duration = this.CACHE_DURATION.tournaments_list
      if (type === 'tournament_details' && status) {
        duration = this.CACHE_DURATION[status as keyof typeof this.CACHE_DURATION] || duration
      }
      
      if (!this.isValid(entry, duration)) {
        localStorage.removeItem(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.warn('Client cache get error:', error)
      return null
    }
  }

  // Set cached data
  set<T>(type: string, data: T, id?: string | number, status?: string): void {
    try {
      const key = this.getKey(type, id)
      const entry: ClientCacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      }
      
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Client cache set error:', error)
      // Handle localStorage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldEntries()
        // Retry once
        try {
          const key = this.getKey(type, id)
          const entry: ClientCacheEntry<T> = {
            data,
            timestamp: Date.now(),
            version: this.CACHE_VERSION
          }
          localStorage.setItem(key, JSON.stringify(entry))
        } catch (retryError) {
          console.warn('Client cache retry failed:', retryError)
        }
      }
    }
  }

  // Invalidate specific entry
  invalidate(type: string, id?: string | number): void {
    const key = this.getKey(type, id)
    localStorage.removeItem(key)
  }

  // Invalidate all tournament-related cache
  invalidateTournaments(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // Clear old entries to free space
  private clearOldEntries(): void {
    const entries: Array<{ key: string; timestamp: number }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const entry = JSON.parse(item)
            entries.push({ key, timestamp: entry.timestamp || 0 })
          }
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key)
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove oldest 25%
    entries.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = Math.floor(entries.length * 0.25)
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key)
    }
  }

  // Get cache statistics
  getStats(): { total: number; size: string; entries: Array<{ key: string; age: string; size: string }> } {
    let total = 0
    let totalSize = 0
    const entries: Array<{ key: string; age: string; size: string }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        total++
        const item = localStorage.getItem(key)
        if (item) {
          const size = new Blob([item]).size
          totalSize += size
          
          try {
            const entry = JSON.parse(item)
            const age = Math.floor((Date.now() - (entry.timestamp || 0)) / 1000 / 60) // minutes
            entries.push({
              key: key.replace(this.CACHE_PREFIX, ''),
              age: `${age}m`,
              size: `${(size / 1024).toFixed(1)}KB`
            })
          } catch {
            entries.push({
              key: key.replace(this.CACHE_PREFIX, ''),
              age: 'unknown',
              size: `${(size / 1024).toFixed(1)}KB`
            })
          }
        }
      }
    }
    
    return {
      total,
      size: `${(totalSize / 1024).toFixed(1)}KB`,
      entries: entries.slice(0, 10) // Show first 10 entries
    }
  }

  // Clear all cache
  clear(): void {
    this.invalidateTournaments()
  }
}

// Singleton instance
export const clientCache = new ClientCache()
