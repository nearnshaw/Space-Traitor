// data per each room
export class roomData {
  gameActive: boolean = false
  players: Player[] = []
  traitors: number[] = []
  // blueTeam: Player[] = []
  // redTeam: Player[] = []
  tiles: tileColor[][] = new Array(14)
    .fill(null)
    .map(() => new Array(14).fill(null))
  // TODO add time remaining
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
}

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

export type TilePosition = { i: number; j: number }

type TileChange = {
  position: TilePosition
  color: tileColor
  sender?: string
}

export type FullState = {
  active: boolean
  playerIsTraitor: boolean
  tiles: tileColor[][]
  timeLeft?: number
  blue?: number
  red?: number
}
