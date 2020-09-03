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
  name: string = 'test'
  thumb: string = 'path'
  isTraitor: boolean = false
  alive: boolean = true
  votes: number[] = []
  constructor(id: number, traitor: boolean) {
    super()
    this.id = id
    this.isTraitor = traitor
  }
}
