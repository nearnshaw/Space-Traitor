import { MultiplayerEntity } from './MultiplayerEntity'
import { Fixable } from './Tile'
//import { game } from '../game'

export class Board extends MultiplayerEntity<FixableChange, FullState> {
  public toFix: Fixable[]
  public toSabbotage: Fixable[]
  public active: boolean = false
  public timeLeft: number

  constructor() {
    super('Board')
    engine.addEntity(this)

    // this.tiles = []
    // for (let i = 0; i < GRIDX; i++) {
    //   this.tiles[i] = []
    //   for (let j = 0; j < GRIDZ; j++) {
    //     const position = { i, j }
    //     const tile = new Tile(position, (position, color) =>
    //       this.propagateChange({ position, color })
    //     )
    //     tile.setParent(this)
    //     this.tiles[i][j] = tile
    //   }
    // }
  }

  protected reactToSingleChanges(change: FixableChange): void {
    // const { position, color } = change
    // this.tiles[position.i][position.j].activate(color)
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

type FixableChange = {
  //   position: TilePosition
  //   color: tileColor
  //   sender?: string
}

type BreakableChange = {}

type FullState = {
  type: string
  active: boolean
  tiles: Fixable[]
  timeLeft?: number
  blue?: number
  red?: number
}
