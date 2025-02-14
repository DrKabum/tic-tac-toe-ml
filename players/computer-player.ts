import { parse } from 'yaml'

import type { Round } from '../game/game'
import type Player from './player'
import { selectRandomly } from '../utils/utils'

type Strategy = {
  pattern: string
  choices: {
    index: number
    weight: number
    played: number
  }[]
}

export default class ComputerPlayer implements Player {
  strategyFile: string
  strategies: Strategy[]
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

  constructor(
    strategyFile: string,
    name: string = 'CPU',
    symbol: 'X' | 'O' = 'X'
  ) {
    this.strategyFile = strategyFile
    this.strategies = []
    this.symbol = symbol
    this.needsOptionDisplay = false
    this.name = name
    this.messages = {
      onTurn: () => '',
      onWin: () => '',
      onLose: () => '',
      onDraw: () => '',
      beforePlay: () => '',
      afterPlay: () => '',
    }
  }

  async initialise(): Promise<void> {
    const file = Bun.file(this.strategyFile)
    const fileExists = await file.exists()

    this.messages = {
      onTurn: await this.generateMessageFunction('on-turn'),
      onWin: await this.generateMessageFunction('on-win'),
      onLose: await this.generateMessageFunction('on-lose'),
      onDraw: await this.generateMessageFunction('on-draw'),
      beforePlay: await this.generateMessageFunction('before-play'),
      afterPlay: await this.generateMessageFunction('after-play'),
    }

    this.strategies =
      fileExists && (await file.text()) !== ''
        ? (this.strategies = JSON.parse(await file.text()))
        : (this.strategies = [])
  }

  findStrategy(pattern: string): Strategy | undefined {
    return this.strategies.find((s) => s.pattern === pattern)
  }

  createNewStrategy(pattern: string): Strategy {
    const choices = []

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === ' ') {
        choices.push({ index: i, weight: 5, played: 0 })
      }
    }

    return {
      pattern,
      choices,
    }
  }

  async getPlayIndex(round: Round): Promise<number> {
    let strategy = this.findStrategy(round.board.pattern)

    if (!strategy) {
      strategy = this.createNewStrategy(round.board.pattern)
      this.strategies.push(strategy)
    }

    const totalWeight = strategy.choices.reduce(
      (acc, curr) => acc + curr.weight,
      0
    )
    const roll = Math.floor(Math.random() * (totalWeight + 1))

    let accumulatedWeights = 0
    let play = Infinity

    for (let i = 0; i < strategy.choices.length; i++) {
      if (accumulatedWeights + strategy.choices[i].weight >= roll) {
        play = strategy.choices[i].index
        break
      }

      accumulatedWeights += strategy.choices[i].weight
    }

    if (play === Infinity) {
      throw Error('Computer player was not able to find a solution')
    }

    return play
  }

  onWin(rounds: Round[]) {
    this.learn(rounds, 2)
  }

  onDraw(rounds: Round[]) {
    this.learn(rounds, 1)
  }

  onLose(rounds: Round[]) {
    this.learn(rounds, -1)
  }

  learn(rounds: Round[], increment: number): void {
    for (const round of rounds) {
      if (round.player !== this || !round.playedIndex) continue

      const strategy = this.findStrategy(round.board.pattern)

      if (!strategy) {
        throw Error(
          `Strategy "${round.board.pattern}" not found during learning for ${this.name}.`
        )
      }

      const strategyChoice = strategy.choices.find(
        (c) => c.index === round.playedIndex
      )

      if (!strategyChoice) {
        throw Error('No choice was found for that index')
      }

      strategyChoice.weight = Math.max(strategyChoice.weight + increment, 1)
      strategyChoice.played++
    }
  }

  async generateMessageFunction(eventName: string) {
    const messages = parse(await Bun.file('data/computer-messages.yml').text())

    if (messages[eventName].length === 0) {
      return () => ''
    }

    return () =>
      this.name + ': ' + selectRandomly(messages[eventName] as string[])
  }

  async saveStrategies() {
    await Bun.write(this.strategyFile, JSON.stringify(this.strategies, null, 2))
  }
}
