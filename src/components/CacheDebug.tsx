'use client'

import React from 'react'
import { Box, Typography, Button, Card, CardContent, Collapse, Divider } from '@mui/material'
import { useCacheManagement } from '@/hooks/useCacheManagement'
import { clientCache } from '@/lib/clientCache'

export function CacheDebug() {
  const { cacheStats, refreshStats, clearAllCache, invalidateInProgress } = useCacheManagement()
  const [expanded, setExpanded] = React.useState(false)
  const [clientStats, setClientStats] = React.useState(() => clientCache.getStats())

  const refreshClientStats = React.useCallback(() => {
    setClientStats(clientCache.getStats())
  }, [])

  const clearClientCache = React.useCallback(() => {
    clientCache.clear()
    refreshClientStats()
  }, [refreshClientStats])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <Card sx={{ mb: 2, bgcolor: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#00e5ff', fontSize: '0.9rem' }}>
            🗄️ Cache Debug (Dev Only)
          </Typography>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: '#00e5ff', fontSize: '0.8rem' }}
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Server Cache Stats */}
            <Typography variant="subtitle2" sx={{ color: '#00e5ff', mb: 1 }}>
              🖥️ Server Cache
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0bec5', mb: 1 }}>
              Total Cached Items: <strong>{cacheStats.total}</strong>
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#b0bec5', mb: 2 }}>
              By Status:
              <Box component="span" sx={{ ml: 2 }}>
                ✅ Completed: <strong>{cacheStats.byStatus.completed}</strong>
              </Box>
              <Box component="span" sx={{ ml: 2 }}>
                🔄 In-Progress: <strong>{cacheStats.byStatus.in_progress}</strong>
              </Box>
              <Box component="span" sx={{ ml: 2 }}>
                ⏳ Pending: <strong>{cacheStats.byStatus.pending}</strong>
              </Box>
            </Typography>

            <Divider sx={{ bgcolor: 'rgba(0, 229, 255, 0.2)', my: 2 }} />

            {/* Client Cache Stats */}
            <Typography variant="subtitle2" sx={{ color: '#00e5ff', mb: 1 }}>
              💾 Client Cache (Browser)
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0bec5', mb: 1 }}>
              Total Items: <strong>{clientStats.total}</strong> | 
              Size: <strong>{clientStats.size}</strong>
            </Typography>

            {clientStats.entries.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                  Recent entries:
                </Typography>
                {clientStats.entries.map((entry, index) => (
                  <Typography key={index} variant="caption" sx={{ color: '#888', display: 'block', ml: 2 }}>
                    • {entry.key} (Age: {entry.age}, Size: {entry.size})
                  </Typography>
                ))}
              </Box>
            )}

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => { refreshStats(); refreshClientStats(); }}
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: '#00e5ff',
                  color: '#00e5ff'
                }}
              >
                🔄 Refresh All
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                onClick={invalidateInProgress}
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: '#ff9800',
                  color: '#ff9800'
                }}
              >
                🔄 Clear Server In-Progress
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                onClick={clearClientCache}
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: '#9c27b0',
                  color: '#9c27b0'
                }}
              >
                🗑️ Clear Client Cache
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                onClick={clearAllCache}
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: '#f44336',
                  color: '#f44336'
                }}
              >
                🗑️ Clear Server All
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              💡 <strong>Server:</strong> Completed=30min, In-Progress=2min, Pending=10min | 
              <strong> Client:</strong> Completed=1hr, In-Progress=5min, Pending=30min
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}
