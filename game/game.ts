import type Player from '../players/player'
import { replaceAt } from '../utils/utils'
import Board from './board'

export type Round = {
  board: Board
  player: Player | null
  playedIndex: number | null
}

export class Game {
  rounds: Round[]
  players: Player[]
  log: (message: string) => void

  constructor(
    playerOne: Player,
    playerTwo: Player,
    log: (message: string) => void
  ) {
    this.players = this.shufflePlayers([playerOne, playerTwo])
    this.log = log
    this.rounds = [
      {
        board: new Board('         '),
        player: this.players[0],
        playedIndex: null,
      },
    ]
  }

  shufflePlayers(players: Player[]): Player[] {
    const output: Player[] = []
    output.push(
      ...players.splice(Math.floor(Math.random() * players.length), 1)
    )
    output.push(players.pop()!)
    return output
  }

  isGameWon(pattern: string) {
    const rows = this.getPatternRows(pattern)
    const columns = this.getPatternColumns(pattern)

    for (const group of rows.concat(columns)) {
      if (group[0] !== ' ' && group[0] === group[1] && group[1] === group[2]) {
        return true
      }
    }

    if (
      rows[0][0] !== ' ' &&
      rows[0][0] === rows[1][1] &&
      rows[1][1] === rows[2][2]
    ) {
      return true
    }

    if (
      rows[0][2] !== ' ' &&
      rows[0][2] === rows[1][1] &&
      rows[1][1] === rows[2][0]
    ) {
      return true
    }

    return false
  }

  isGameDraw(pattern: string) {
    return !/\s/.test(pattern)
  }

  getPatternRows(pattern: string): string[][] {
    const rows = []
    for (let i = 0; i < 3; i++) {
      rows.push([pattern[0 + i * 3], pattern[1 + i * 3], pattern[2 + i * 3]])
    }
    return rows
  }

  getPatternColumns(pattern: string): string[][] {
    const columns = []
    for (let i = 0; i < 3; i++) {
      columns.push([pattern[0 + i], pattern[3 + i], pattern[6 + i]])
    }
    return columns
  }

  async run() {
    let isGameOver = false
    let outcome = ''

    while (!isGameOver) {
      const round = this.rounds[this.rounds.length - 1]
      this.log(`\n==================`)
      this.log(`Round ${this.rounds.length}`)
      const player = this.players[(this.rounds.length - 1) % 2]
      const opponent = this.players[this.rounds.length % 2]

      this.log(player.messages.onTurn())

      this.log('\n')
      this.log(
        player.needsOptionDisplay
          ? round.board.patternDisplayWithOption
          : round.board.patternDisplay
      )
      this.log('\n')

      this.log(player.messages.beforePlay())
      const playIndex = await player.getPlayIndex(round)
      this.log(`${player.name} played ${player.symbol} in cell ${playIndex}`)
      this.log(player.messages.afterPlay())

      round.playedIndex = playIndex

      const newPattern = replaceAt(
        this.rounds[this.rounds.length - 1].board.pattern,
        player.symbol,
        playIndex
      )

      this.rounds.push({
        board: new Board(newPattern),
        player: opponent,
        playedIndex: null,
      })

      if (this.isGameWon(newPattern)) {
        this.log(player.messages.onWin())
        player.onWin(this.rounds)
        this.log(opponent.messages.onLose())
        opponent.onLose(this.rounds)
        isGameOver = true
        outcome = `Game won by ${player.name}`
      } else if (this.isGameDraw(newPattern)) {
        this.log(player.messages.onDraw())
        player.onDraw(this.rounds)
        this.log(opponent.messages.onDraw())
        opponent.onDraw(this.rounds)
        isGameOver = true
        outcome = `Game is a draw.`
      }
    }

    this.log('')
    this.log(this.rounds[this.rounds.length - 1].board.patternDisplay)

    return outcome
  }
}
