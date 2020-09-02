import { ITEMS_IN_SHIP } from '.'

// data per each room
export class roomData {
  gameActive: boolean = false
  players: Player[] = []
  traitors: number[] = []
  timeLeft: number = 0
  toFix: EquiptmentChange[] = new Array(ITEMS_IN_SHIP)
  //     .fill(null)
  //.map({id: 1, state: true})
}

export interface roomDictionary {
  [index: string]: roomData
}

export class Player extends Object {
  id: number
  isTraitor: boolean = false
  constructor(id: number, traitor: boolean) {
    super()
    this.id = id
    this.isTraitor = traitor
  }
}

export enum MessageType {
  JOIN = 'join',
  NEWGAME = 'new',
  END = 'end',
  MESSAGE = 'msg',
  STARTVOTE = 'startvote',
  VOTE = 'vote',
  FIX = 'fix',
  BREAK = 'break',
}

export type FullState = {
  active: boolean
  playerIsTraitor: boolean
  timeLeft?: number
  toFix: EquiptmentChange[]
}

type EquiptmentChange = {
  id: number
  broken: boolean
}
