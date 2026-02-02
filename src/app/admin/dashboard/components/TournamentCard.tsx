import React from 'react'
import { Box, Typography, Button, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useCollapsible } from '../hooks/useCollapsible'

interface TournamentCardProps {
  tournament: any
  selectedTournament: number | null
  generateLoading: boolean
  submitScoreLoading: boolean
  categorizeMatches: (matches: any[], tournamentType: string) => Record<string, any>
  getCategoryDisplayOrder: (tournamentType: string) => string[]
  shouldExpandSection: (categoryName: string, status: 'inProgress' | 'completed', hasMatches: boolean) => boolean
  getPlayerName: (tournament: any, playerId: number) => string
  onSetScore: (matchId: number) => void
  onGenerateMatches: (tournamentId: number) => void
  onDeleteTournament: (tournamentId: number, tournamentName: string) => void
  onRemovePlayer: (tournamentId: number, playerId: number, playerName: string) => void
  onSelectTournament: (tournamentId: number) => void
  onShowStandings: (tournamentId: number) => void
  onShowGroupStandings: (tournamentId: number) => void
  onShowKnockoutBracket: (tournamentId: number) => void
}

export function TournamentCard({ 
  tournament: t, 
  selectedTournament,
  generateLoading,
  submitScoreLoading,
  categorizeMatches,
  getCategoryDisplayOrder,
  shouldExpandSection,
  getPlayerName,
  onSetScore, 
  onGenerateMatches, 
  onDeleteTournament, 
  onRemovePlayer,
  onSelectTournament,
  onShowStandings,
  onShowGroupStandings,
  onShowKnockoutBracket
}: TournamentCardProps) {
  const collapsible = useCollapsible()

  return (
    <Card key={t.id} className="tournament-admin-card" sx={{ mb: 1 }}>
      <CardContent>
        <Typography className="tournament-name">
          {t.name} <span className="tournament-id">(id: {t.id})</span>
        </Typography>
        <Typography variant="body2" className="tournament-status">
          Status: {t.status}
        </Typography>
        <Typography variant="body2" sx={{ color: '#81c784', fontWeight: 'bold' }}>
          Type: {t.type === 'group_and_knockout' ? 'Group + Knockout' : 'Round Robin'}
        </Typography>
        {t.type === 'group_and_knockout' && (
          <Typography variant="caption" sx={{ color: '#b0bec5', display: 'block' }}>
            {t.teams_per_group} per group, {t.teams_advancing_per_group} advance
            {t.allow_third_place_teams && ' + 3rd place teams'}
            {t.third_place_playoff && ', 3rd place playoff'}
          </Typography>
        )}
        
        <Box className="tournament-actions">
          <Button
            sx={{ mr: 1 }}
            onClick={() => onSelectTournament(t.id)}
            className="action-button"
            variant={selectedTournament === t.id ? "contained" : "outlined"}
          >
            {selectedTournament === t.id ? "Selected" : "Select"}
          </Button>
          {t.status !== 'completed' && (
            <Button
              onClick={() => onGenerateMatches(t.id)}
              disabled={generateLoading}
              className="action-button"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              {generateLoading ? 'Generating...' : 'Generate Matches'}
            </Button>
          )}
          <Button
            onClick={() => onDeleteTournament(t.id, t.name)}
            className="action-button"
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>

        {/* Players Accordion */}
        <Accordion
          expanded={collapsible.expandedPlayers.has(t.id)}
          onChange={() => collapsible.togglePlayersExpansion(t.id)}
          sx={{ mt: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" className="section-subtitle">
              Players in Tournament ({t.players?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className="players-list">
              {t.players?.map((p: any) => (
                <Box key={p.id} className="player-item" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <Box>
                    <span className="player-name">{p.name}</span>
                    <Typography variant="caption" sx={{ color: '#81c784', display: 'block' }}>
                      In Tournament
                    </Typography>
                  </Box>
                  {t.status === 'pending' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onRemovePlayer(t.id, p.id, p.name)}
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              {(!t.players || t.players.length === 0) && (
                <Typography variant="body2" sx={{ color: '#b0bec5', fontStyle: 'italic' }}>
                  No players added to this tournament yet
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Matches Accordion */}
        <Accordion
          expanded={collapsible.expandedMatches.has(t.id)}
          onChange={() => collapsible.toggleMatchesExpansion(t.id)}
          sx={{ mt: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" className="section-subtitle">
              Matches ({t.matches?.length || 0})
              {(() => {
                const inProgressCount = t.matches?.filter((m: any) => m.status !== 'completed').length || 0
                return (
                  <Typography component="span" sx={{ 
                    color: inProgressCount > 0 ? '#ff9800' : '#4caf50', 
                    fontSize: '0.8rem', 
                    ml: 1,
                    fontWeight: 500
                  }}>
                    {inProgressCount > 0 ? `${inProgressCount} pending` : 'All completed'}
                  </Typography>
                )
              })()}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(() => {
              const categorizedMatches = categorizeMatches(t.matches || [], t.type)
              const categoryOrder = getCategoryDisplayOrder(t.type)
              
              // Get all category keys and sort them
              const allCategories = Object.keys(categorizedMatches)
              const orderedCategories: string[] = []
              
              // First add known categories in priority order
              categoryOrder.forEach(category => {
                if (allCategories.includes(category)) {
                  orderedCategories.push(category)
                }
              })
              
              // Then add group categories alphabetically
              const groupCategories = allCategories
                .filter(cat => cat.startsWith('Group') && !orderedCategories.includes(cat))
                .sort()
              
              orderedCategories.push(...groupCategories)
              
              // Add any remaining categories
              allCategories.forEach(cat => {
                if (!orderedCategories.includes(cat)) {
                  orderedCategories.push(cat)
                }
              })

              if (orderedCategories.length === 0) {
                return (
                  <Typography variant="body2" sx={{ color: '#b0bec5', fontStyle: 'italic' }}>
                    No matches generated yet
                  </Typography>
                )
              }

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {orderedCategories.map(categoryName => {
                    const category = categorizedMatches[categoryName]
                    const inProgressCount = category.inProgress.length
                    const completedCount = category.completed.length
                    const totalCount = inProgressCount + completedCount
                    
                    if (totalCount === 0) return null

                    return (
                      <Box key={categoryName} sx={{ 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: 1, 
                        p: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#00e5ff', 
                          mb: 1, 
                          fontSize: '1rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>{categoryName}</span>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {inProgressCount > 0 && (
                              <Typography component="span" sx={{ 
                                color: '#ff9800', 
                                fontSize: '0.75rem', 
                                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontWeight: 600
                              }}>
                                {inProgressCount} pending
                              </Typography>
                            )}
                            <Typography component="span" sx={{ 
                              color: '#b0bec5', 
                              fontSize: '0.75rem', 
                              fontWeight: 400
                            }}>
                              {totalCount} total
                            </Typography>
                          </Box>
                        </Typography>

                        {/* In Progress Section */}
                        {inProgressCount > 0 && (
                          <Box sx={{ mb: inProgressCount > 0 && completedCount > 0 ? 2 : 0 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              p: 0.5,
                              borderRadius: 1,
                              border: '1px solid rgba(255, 152, 0, 0.2)',
                              backgroundColor: 'rgba(255, 152, 0, 0.03)',
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 152, 0, 0.08)',
                                borderColor: 'rgba(255, 152, 0, 0.4)'
                              }
                            }}
                            onClick={() => collapsible.toggleMatchSectionExpansion(t.id, categoryName, 'inProgress')}
                            >
                              <Typography variant="subtitle2" sx={{ 
                                color: '#ff9800', 
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                🔄 In Progress
                                <Typography component="span" sx={{ 
                                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                  color: '#ff9800',
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}>
                                  {inProgressCount}
                                </Typography>
                              </Typography>
                              <IconButton size="small" sx={{ color: '#ff9800' }}>
                                <ExpandMoreIcon sx={{
                                  transform: (collapsible.expandedMatchSections.has(`${t.id}-${categoryName}-inProgress`) || shouldExpandSection(categoryName, 'inProgress', inProgressCount > 0)) ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 300ms',
                                  fontSize: 20
                                }} />
                              </IconButton>
                            </Box>
                            <Collapse in={collapsible.expandedMatchSections.has(`${t.id}-${categoryName}-inProgress`) || shouldExpandSection(categoryName, 'inProgress', inProgressCount > 0)} timeout="auto">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                {category.inProgress.map((m: any) => (
                                  <Box key={m.id} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(255, 152, 0, 0.3)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                      transform: 'translateX(2px)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                                        {getPlayerName(t, m.player1_id)} vs {getPlayerName(t, m.player2_id)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                                        Score: {m.score1 ?? '-'} : {m.score2 ?? '-'} • Click to update
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      onClick={() => onSetScore(m.id)}
                                      disabled={submitScoreLoading}
                                      variant="contained"
                                      sx={{ 
                                        minWidth: 'auto',
                                        backgroundColor: '#ff9800',
                                        '&:hover': { backgroundColor: '#f57c00' },
                                        fontWeight: 600
                                      }}
                                    >
                                      Update
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        )}

                        {/* Completed Section */}
                        {completedCount > 0 && (
                          <Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              p: 0.5,
                              borderRadius: 1,
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                              backgroundColor: 'rgba(76, 175, 80, 0.03)',
                              '&:hover': { 
                                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                borderColor: 'rgba(76, 175, 80, 0.4)'
                              }
                            }}
                            onClick={() => collapsible.toggleMatchSectionExpansion(t.id, categoryName, 'completed')}
                            >
                              <Typography variant="subtitle2" sx={{ 
                                color: '#4caf50', 
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                ✅ Completed
                                <Typography component="span" sx={{ 
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  color: '#4caf50',
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}>
                                  {completedCount}
                                </Typography>
                              </Typography>
                              <IconButton size="small" sx={{ color: '#4caf50' }}>
                                <ExpandMoreIcon sx={{
                                  transform: collapsible.expandedMatchSections.has(`${t.id}-${categoryName}-completed`) ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 300ms',
                                  fontSize: 20
                                }} />
                              </IconButton>
                            </Box>
                            <Collapse in={collapsible.expandedMatchSections.has(`${t.id}-${categoryName}-completed`)} timeout="auto">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                {category.completed.map((m: any) => (
                                  <Box key={m.id} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                                        {getPlayerName(t, m.player1_id)} vs {getPlayerName(t, m.player2_id)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#81c784', fontWeight: 600 }}>
                                        Final: {m.score1} : {m.score2}
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      onClick={() => onSetScore(m.id)}
                                      disabled={submitScoreLoading}
                                      variant="outlined"
                                      sx={{ 
                                        minWidth: 'auto',
                                        borderColor: '#4caf50',
                                        color: '#4caf50',
                                        '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              )
            })()}
          </AccordionDetails>
        </Accordion>
        
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => onShowStandings(t.id)}
            className="standings-button"
            size="small"
          >
            Show Standings
          </Button>
          {t.type === 'group_and_knockout' && (
            <>
              <Button
                variant="outlined"
                onClick={() => onShowGroupStandings(t.id)}
                className="standings-button"
                size="small"
                sx={{ color: '#81c784', borderColor: '#81c784' }}
              >
                Group Tables
              </Button>
              <Button
                variant="outlined"
                onClick={() => onShowKnockoutBracket(t.id)}
                className="standings-button"
                size="small"
                sx={{ color: '#ff9800', borderColor: '#ff9800' }}
              >
                Knockout Bracket
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}