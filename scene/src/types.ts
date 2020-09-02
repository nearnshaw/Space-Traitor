import { EquiptmentType } from './entities/equipment'

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

export class EquiptmentData {
  transform: TranformConstructorArgs
  type: EquiptmentType
  startBroken?: boolean
}
