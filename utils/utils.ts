export async function prompt(promptText: string): Promise<string> {
  process.stdout.write(promptText)
  for await (const line of console) {
    return line
  }

  return ""
}

export function replaceAt(str: string, character: string, index: number) {
  return str.substring(0, index) + character + str.substring(index+1)
}

export function selectRandomly<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function log(logAllowed: boolean) {
  return logAllowed
    ? (message: string) => (message !== '' ? console.log(message) : undefined)
    : (message: string) => undefined
}