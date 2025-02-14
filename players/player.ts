import type { Round } from "../game/game"

export default interface Player {
  symbol: 'X' | 'O'
  getPlayIndex: (round: Round) => Promise<number>
  needsOptionDisplay: boolean
  onWin: (rounds: Round[]) => void
  onDraw: (rounds: Round[]) => void
  onLose: (rounds: Round[]) => void
  name: string
  messages: {
    onTurn: () => string
    onWin: () => string
    onLose: () => string
    onDraw: () => string
    beforePlay: () => string
    afterPlay: () => string
  }
}