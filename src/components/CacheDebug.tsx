'use client'

import React from 'react'
import { Box, Typography, Button, Card, CardContent, Collapse } from '@mui/material'
import { useCacheManagement } from '@/hooks/useCacheManagement'

export function CacheDebug() {
  const { cacheStats, refreshStats, clearAllCache, invalidateInProgress } = useCacheManagement()
  const [expanded, setExpanded] = React.useState(false)

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

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={refreshStats}
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: '#00e5ff',
                  color: '#00e5ff'
                }}
              >
                🔄 Refresh Stats
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
                🔄 Clear In-Progress
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
                🗑️ Clear All
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
              💡 Completed tournaments cache for 30min, In-progress for 2min, Pending for 10min
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}
