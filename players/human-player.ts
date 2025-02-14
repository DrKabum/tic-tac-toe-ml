import type { Round } from '../game/game'
import { prompt } from '../utils/utils'
import type Player from './player'

export default class HumanPlayer implements Player {
  symbol: 'X' | 'O'
  needsOptionDisplay: boolean
  name: string
  messages: {
    onTurn: () => string
    onWin: () => string
    onLose: () => string
    onDraw: () => string
    beforePlay: () => string
    afterPlay: () => string
  }

  constructor(name: string = 'You', symbol: 'X' | 'O' = 'O') {
    this.symbol = symbol
    this.needsOptionDisplay = true
    this.name = name
    this.messages = {
      onTurn: () => "It's your turn to play!",
      onWin: () => 'Congratulations, you won!',
      onLose: () => 'You lose. Maybe next time!',
      onDraw: () =>
        `It's a draw! Don't worry, most of the time it's the best possible outcome!`,
      beforePlay: () => '',
      afterPlay: () => '',
    }
  }

  async getPlayIndex(round: Round): Promise<number> {
    let input: string = (
      await prompt('Pick the number of a cell to play: ')
    ).trim()

    while (
      !/^\w*$/.test(input) || // must not be spaces (if only white spaces, trim() doesn't remove them)
      input === '' || // No empty input as JS converts them to 0
      isNaN(+input) || // must be a valid number
      !round.board.optionIndexes.includes(+input) // must be one of the possible options
    ) {
      console.log('Invalid choice')
      input = await prompt('Type the number of a cell to play: ')
    }

    return +input
  }

  onWin(rounds: Round[]) {}

  onDraw(rounds: Round[]) {}

  onLose(rounds: Round[]) {}
}
