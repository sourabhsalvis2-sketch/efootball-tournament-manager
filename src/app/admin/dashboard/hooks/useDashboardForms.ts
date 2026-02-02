import { useState } from 'react'

export function useDashboardForms() {
  // Tournament form state
  const [name, setName] = useState('')
  const [tournamentType, setTournamentType] = useState<'round_robin' | 'group_and_knockout'>('round_robin')
  const [teamsPerGroup, setTeamsPerGroup] = useState(4)
  const [teamsAdvancing, setTeamsAdvancing] = useState(2)
  const [allowThirdPlace, setAllowThirdPlace] = useState(false)
  const [thirdPlacePlayoff, setThirdPlacePlayoff] = useState(false)

  // Player form state
  const [playerName, setPlayerName] = useState('')

  // UI visibility state
  const [showCreateTournament, setShowCreateTournament] = useState(false)
  const [showCreatePlayer, setShowCreatePlayer] = useState(false)
  const [showAllPlayers, setShowAllPlayers] = useState(false)

  const resetTournamentForm = () => {
    setName('')
    setTournamentType('round_robin')
    setTeamsPerGroup(4)
    setTeamsAdvancing(2)
    setAllowThirdPlace(false)
    setThirdPlacePlayoff(false)
  }

  const resetPlayerForm = () => {
    setPlayerName('')
  }

  const getTournamentFormData = () => ({
    name,
    type: tournamentType,
    teamsPerGroup,
    teamsAdvancing,
    allowThirdPlace,
    thirdPlacePlayoff
  })

  return {
    // Tournament form
    name,
    setName,
    tournamentType,
    setTournamentType,
    teamsPerGroup,
    setTeamsPerGroup,
    teamsAdvancing,
    setTeamsAdvancing,
    allowThirdPlace,
    setAllowThirdPlace,
    thirdPlacePlayoff,
    setThirdPlacePlayoff,
    resetTournamentForm,
    getTournamentFormData,

    // Player form
    playerName,
    setPlayerName,
    resetPlayerForm,

    // UI visibility
    showCreateTournament,
    setShowCreateTournament,
    showCreatePlayer,
    setShowCreatePlayer,
    showAllPlayers,
    setShowAllPlayers
  }
}