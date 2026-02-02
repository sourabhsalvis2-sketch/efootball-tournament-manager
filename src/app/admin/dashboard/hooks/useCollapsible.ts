import { useState } from 'react'

export function useCollapsible() {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<number>>(new Set())
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set())
  const [expandedMatchSections, setExpandedMatchSections] = useState<Set<string>>(new Set())

  const togglePlayersExpansion = (tournamentId: number) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tournamentId)) {
        newSet.delete(tournamentId)
      } else {
        newSet.add(tournamentId)
      }
      return newSet
    })
  }

  const toggleMatchesExpansion = (tournamentId: number) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tournamentId)) {
        newSet.delete(tournamentId)
      } else {
        newSet.add(tournamentId)
      }
      return newSet
    })
  }

  const toggleMatchSectionExpansion = (tournamentId: number, categoryName: string, status: 'inProgress' | 'completed') => {
    const key = `${tournamentId}-${categoryName}-${status}`
    setExpandedMatchSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  return {
    expandedPlayers,
    expandedMatches,
    expandedMatchSections,
    togglePlayersExpansion,
    toggleMatchesExpansion,
    toggleMatchSectionExpansion
  }
}