import chalk from "chalk"

export default class Board {
  pattern: string
  patternDisplay: string
  patternDisplayWithOption: string
  optionIndexes: number[]

  constructor(pattern: string) {
    this.pattern = this.#isPatternValid(pattern)
    this.patternDisplay = this.#getDisplay(this.pattern)
    this.patternDisplayWithOption = this.#getDisplay(
      this.#insertOptions(this.pattern)
    )
    this.optionIndexes = this.#getOptionsIndexes(this.pattern)
  }

  #isPatternValid(pattern: string) {
    if (
      typeof pattern !== 'string' ||
      pattern.length !== 9 ||
      !/^[XO ]*$/.test(pattern)
    ) {
      throw Error(`pattern is invalid: "${pattern}"`)
    }

    return pattern
  }

  #getDisplay(pattern: string): string {
    const lines = []
    const separator = '\n---+---+---\n'

    for (let i = 0; i < 3; i++) {
      lines.push(
        ` ${pattern[0 + i * 3]} | ${pattern[1 + i * 3]} | ${
          pattern[2 + i * 3]
        } `
      )
    }

    let text = lines.join(separator)
    text = text.replaceAll('X', chalk.red('X'))
    text = text.replaceAll('O', chalk.blue('O'))

    return text
  }

  #getOptionsIndexes(pattern: string): number[] {
    const options: number[] = []
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === ' ') {
        options.push(i)
      }
    }

    return options
  }

  #insertOptions(pattern: string): string {
    return pattern
      .split('')
      .map((c, i) => (c === ' ' ? i : c))
      .join('')
  }
}