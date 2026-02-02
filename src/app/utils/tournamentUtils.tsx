import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SportsIcon from '@mui/icons-material/Sports'
import StarIcon from '@mui/icons-material/Star'

export function getMatchStatusClass(match: any) {
  if (match.status === 'completed') return 'match-status-completed'
  if (match.status === 'ongoing') return 'match-status-ongoing'
  return 'match-status-scheduled'
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
    case 'in_progress': return <SportsIcon sx={{ fontSize: 16, color: '#ff9800' }} />
    case 'pending': return <StarIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />
    default: return <StarIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />
  }
}

export function createPlayerLookup(players: any[]) {
  const lookup: Record<number, string> = {}
  for (const player of (players || [])) {
    lookup[player.id] = player.name
  }
  return lookup
}

export function groupStandings(standings: any[]) {
  return (standings || []).reduce((acc, s) => {
    const groupName = s.group || "Overall"
    if (!acc[groupName]) {
      acc[groupName] = []
    }
    acc[groupName].push(s)
    return acc
  }, {} as Record<string, any[]>)
}

export function sortMatches(matches: any[]) {
  return [...matches].sort((a: any, b: any) => {
    // Define round order: final first, then third-place, semi, quarter, then group
    const roundOrder = { 
      final: 0, 
      'third-place': 1, 
      semi: 2, 
      quarter: 3, 
      'round-of-16': 4,
      group: 5 
    }
    const aOrder = roundOrder[a.round as keyof typeof roundOrder] ?? 6
    const bOrder = roundOrder[b.round as keyof typeof roundOrder] ?? 6
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.id - b.id
  })
}

export function separateMatches(matches: any[]) {
  const sorted = sortMatches(matches)
  const mainMatches = sorted.filter((m: any) => 
    m.round === 'final' || m.round === 'semi' || m.round === 'quarter' || m.round === 'third-place' || m.round === 'round-of-16'
  )
  const otherMatches = sorted.filter((m: any) => 
    m.round !== 'final' && m.round !== 'semi' && m.round !== 'quarter' && m.round !== 'third-place' && m.round !== 'round-of-16'
  )
  return { mainMatches, otherMatches }
}