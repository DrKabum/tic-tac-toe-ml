import { parseArgs } from 'util'

import { MultiBar, Presets } from 'cli-progress'

import { Game } from './game/game'
import ComputerPlayer from './players/computer-player'
import HumanPlayer from './players/human-player'
import { log } from './utils/utils'

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    'battle-of-ai': {
      type: 'boolean',
      default: false,
    },
    'number-of-games': {
      type: 'string',
      default: '1',
    },
  },
  allowPositionals: true,
})

const cpu1 = new ComputerPlayer('data/strategies-cpu1.json', 'CPU-1', 'X')
await cpu1.initialise()

if (!values['battle-of-ai']) {
  const game = new Game(cpu1, new HumanPlayer(), log(true))
  const result = await game.run()

  console.log(result)
  await cpu1.saveStrategies()
} else {
  const NUMBER_OF_GAMES = +values['number-of-games']

  const cpu2 = new ComputerPlayer('data/strategies-cpu2.json', 'CPU-2', 'O')
  await cpu2.initialise()

  const multibarProgress = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: ' {bar} | {metric} | {value}',
    },
    Presets.shades_grey
  )

  const numberOfGamesBar = multibarProgress.create(NUMBER_OF_GAMES, 0, {
    metric: 'Games',
  })

  const drawsBar = multibarProgress.create(0, 0, {
    metric: 'Draws',
  })
  let draws = 0
  const p1WinsBar = multibarProgress.create(0, 0, {
    metric: `${cpu1.name} wins`,
  })
  let p1Wins = 0
  const p2WinsBar = multibarProgress.create(0, 0, {
    metric: `${cpu2.name} wins`,
  })
  let p2Wins = 0

  const dynamicBars = [drawsBar, p1WinsBar, p2WinsBar]

  for (let i = 0; i < NUMBER_OF_GAMES; i++) {
    const game = new Game(cpu1, cpu2, log(false))
    const result = await game.run()
    numberOfGamesBar.increment()
    if (result === 'Game is a draw.') {
      drawsBar.increment()
      draws++
    }
    if (result === `Game won by ${cpu1.name}`) {
      p1WinsBar.increment()
      p1Wins++
    }
    if (result === `Game won by ${cpu2.name}`) {
      p2WinsBar.increment()
      p2Wins++
    }

    dynamicBars.map((b) => b.setTotal(Math.max(draws, p1Wins, p2Wins)))
    multibarProgress.update()
  }

  multibarProgress.stop()
  await cpu1.saveStrategies()
  await cpu2.saveStrategies()
}
