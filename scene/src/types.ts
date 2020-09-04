export enum MessageType {
  JOIN = 'join',
  NEWGAME = 'new',
  END = 'end',
  MESSAGE = 'msg',
  STARTVOTE = 'startvote',
  VOTE = 'vote',
  ENDVOTE = 'endvote',
  FIX = 'fix',
  BREAK = 'break',
}

export class EquiptmentData {
  transform: TranformConstructorArgs
  type: EquiptmentType
  startBroken?: boolean
}

export enum EquiptmentType {
  CONSOLE,
  CABLES,
  OXYGEN,
  REACTOR,
}

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
