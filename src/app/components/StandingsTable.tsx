import React from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { groupStandings } from '@/app/utils/tournamentUtils'

interface StandingsTableProps {
  standings: any[] | null
}

const standingsHeaderCellSx = {
  background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(13,71,161,0.1) 100%)',
  color: '#00e5ff',
  fontWeight: 700,
  fontSize: { xs: '0.6rem', sm: '0.75rem' },
  borderBottom: '2px solid rgba(0,229,255,0.3)',
  padding: { xs: '6px 2px', sm: '8px 4px' }
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const groupedStandings = groupStandings(standings || [])

  if (Object.keys(groupedStandings).length === 0) {
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          📊 Standings
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0bec5' }}>No standings yet</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        📊 Standings
      </Typography>
      {Object.entries(groupedStandings)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, standings]) => {
          const standingsArray = standings as any[]
          return (
        <Box key={groupName} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#00e5ff', mb: 1 }}>
            {groupName}
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(13,27,42,0.95) 100%)',
              border: '1px solid rgba(0,229,255,0.3)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,229,255,0.15)',
              overflowX: 'hidden !important',
              width: '100%'
            }}
          >
            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...standingsHeaderCellSx, width: '8%' }}>#</TableCell>
                  <TableCell sx={{ ...standingsHeaderCellSx, width: '36%' }}>Player</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '9%' }}>Pts</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '6%' }}>P</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '6%' }}>W</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '6%' }}>D</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '6%' }}>L</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '7%' }}>GS</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '7%' }}>GC</TableCell>
                  <TableCell align="center" sx={{ ...standingsHeaderCellSx, width: '9%' }}>GD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standingsArray.map((s: any, index: number) => (
                  <TableRow
                    key={s.playerId}
                    sx={{
                      background: index === 0
                        ? 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,193,7,0.08) 100%)'
                        : index === 1
                          ? 'linear-gradient(90deg, rgba(224,224,224,0.12) 0%, rgba(192,192,192,0.06) 100%)'
                          : index === 2
                            ? 'linear-gradient(90deg, rgba(205,127,50,0.1) 0%, rgba(184,115,51,0.05) 100%)'
                            : 'transparent',
                      border: index === 0
                        ? '1px solid rgba(255,215,0,0.4)'
                        : index === 1
                          ? '1px solid rgba(224,224,224,0.3)'
                          : '1px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(0,229,255,0.08)',
                        transform: 'translateX(4px)',
                        boxShadow: '4px 0 12px rgba(0,229,255,0.2)',
                      }
                    }}
                  >
                    <TableCell sx={{
                      color: index === 0 ? '#ffd700' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : '#ffffff',
                      fontWeight: index < 3 ? 700 : 400,
                      fontSize: '0.875rem',
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      width: '8%'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{
                      color: '#ffffff',
                      fontWeight: index < 3 ? 700 : 500,
                      fontSize: '0.875rem',
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'normal !important',
                      wordWrap: 'break-word',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important',
                      lineHeight: 1.2,
                      minWidth: 0,
                      maxWidth: { xs: '80px', sm: '120px' }
                    }}>
                      {s.name}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#00e5ff',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.points}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#b0bec5',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.played}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#4caf50',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.wins}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#ff9800',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.draws}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#f44336',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.losses}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#81c784',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.goalsFor}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: '#e57373',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.goalsAgainst}
                    </TableCell>
                    <TableCell align="center" sx={{
                      color: s.goalDiff >= 0 ? '#4caf50' : '#f44336',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      fontWeight: 700,
                      padding: { xs: '4px 2px', sm: '6px 4px' },
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible !important',
                      textOverflow: 'unset !important'
                    }}>
                      {s.goalDiff >= 0 ? '+' : ''}{s.goalDiff}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )})}
    </Box>
  )
}