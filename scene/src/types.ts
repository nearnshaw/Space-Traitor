// export enum MessageType {
//   JOIN = 'join',
//   NEWGAME = 'new',
//   END = 'end',
//   MESSAGE = 'msg',
//   STARTVOTE = 'startvote',
//   VOTE = 'vote',
//   ENDVOTE = 'endvote',
//   FIX = 'fix',
//   BREAK = 'break',
// }

export type JoinData = {
  thumb?: string
}

export type EquiptmentChange = {
  id: number
  broken: boolean
}

export type FuseChange = {
  id: number
  doorOpen?: boolean
  redCut?: boolean
  greenCut?: boolean
  blueCut?: boolean
}

export type Vote = {
  voter: string
  voted: string
}
export class EquiptmentData {
  transform: TranformConstructorArgs
  startBroken?: boolean = true
}

// export enum EquiptmentType {
//   CONSOLE,
//   CABLES,
//   OXYGEN,
//   REACTOR,
// }

export class Player extends Object {
  id: number
  name: string
  thumb: string | null
  isTraitor: boolean = false
  alive: boolean = true
  votes: number[] = []
  constructor(id: number, name: string, thumb?: string) {
    super()
    this.id = id
    this.name = name
    this.thumb = thumb ? thumb : null
  }
}
