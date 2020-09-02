import { MultiplayerEntity } from './MultiplayerEntity'
import { Equipment, EquiptmentType } from './equipment'
import { EquiptmentData } from '../types'
//import { game } from '../game'

let equiptMentList: EquiptmentData[] = [
  {
    transform: { position: new Vector3(8, 1, 8) },
    type: EquiptmentType.CONSOLE,
  },
  {
    transform: { position: new Vector3(10, 1, 8) },
    type: EquiptmentType.CONSOLE,
  },
  {
    transform: { position: new Vector3(12, 1, 8) },
    type: EquiptmentType.REACTOR,
  },
]

export class SpaceShip extends MultiplayerEntity<EquiptmentChange, FullState> {
  public toFix: Equipment[]
  // public toSabbotage: Equipment[]
  public active: boolean = false
  public timeLeft: number

  constructor() {
    super('Ship')
    engine.addEntity(this)

    this.toFix = new Array(equiptMentList.length)

    for (let i = 0; i < equiptMentList.length; i++) {
      let eq = new Equipment(
        i,
        equiptMentList[i].transform,
        equiptMentList[i].type,
        (state) => {
          this.propagateChange({ id: i, broken: state })
        },
        equiptMentList[i].startBroken
      )
      this.toFix.push(eq)
    }
  }

  protected reactToSingleChanges(change: EquiptmentChange): void {
    this.toFix[change.id].change(change.broken)
    // UI changes
  }

  protected loadFullState(fullState: FullState): void {
    this.active = fullState.active
    if (fullState.active == true) {
      //game.startGame(fullState.timeLeft)
    } else {
      //game.defaultBoard()
    }
    // for (let i = 0; i < GRIDX; i++) {
    //   for (let j = 0; j < GRIDX; j++) {
    //     this.tiles[i][j].activate(fullState.tiles[i][j])
    //   }
    // }
  }

  resetAllGame(): void {
    // for (let i = 0; i < GRIDX; i++) {
    //   for (let j = 0; j < GRIDX; j++) {
    //     this.tiles[i][j].activate(tileColor.NEUTRAL)
    //   }
    // }
  }

  countFixes(): number[] {
    let fixCount = [0, 0]
    // for (let i = 0; i < GRIDX; i++) {
    //   for (let j = 0; j < GRIDX; j++) {
    //     if (this.tiles[i][j].getColor() == tileColor.BLUE) {
    //       tileCount[0] += 1
    //     } else if (this.tiles[i][j].getColor() == tileColor.RED) {
    //       tileCount[1] += 1
    //     }
    //   }
    // }

    return fixCount
  }
}

type EquiptmentChange = {
  id: number
  broken: boolean
}

type FullState = {
  active: boolean
  toFix: EquiptmentChange[]
  timeLeft?: number
  playerIsTraitor?: boolean
}
