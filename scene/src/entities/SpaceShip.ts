import { MultiplayerEntity } from './MultiplayerEntity'
import { Equipment } from './equipment'
import { EquiptmentData, MessageType } from '../types'
import { Button } from './Button'
import { startUI, fixCounter } from '../HUD'

export let playerIsTraitor: boolean = false
export let playerIsAlive: boolean = true

let equiptMentList: EquiptmentData[] = [
  {
    transform: { position: new Vector3(8, 1, 8) }, startBroken: true
  },
  {
    transform: { position: new Vector3(10, 1, 8) }, startBroken: true
  },
  {
    transform: { position: new Vector3(8, 1, 14) }, startBroken: true
  },
  {
    transform: { position: new Vector3(10, 1, 14) }, startBroken: true
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

    this.toFix = [] //new Array(equiptMentList.length)

    for (let i = 0; i < equiptMentList.length; i++) {
      let eq = new Equipment(
        i,
        equiptMentList[i].transform,
        //equiptMentList[i].type,
        (state) => {
          this.propagateChange({
            id: i,
            broken: state,
            fixCount: 0,
            timeLeft: this.timeLeft,
          })
        },
        equiptMentList[i].startBroken
      )
      this.toFix.push(eq)
    }

    let panicButton = new Button(
      {
        position: new Vector3(20, 1, 20),
      },
      new GLTFShape('models/Danger_SciFi_Button.glb'),
      () => {
        this.socket.send(
          JSON.stringify({
            type: MessageType.STARTVOTE,
            data: null,
          })
        )
      },
      'Emergency Meeting'
    )
  }

  protected reactToSingleChanges(change: EquiptmentChange): void {
    log('reacting to single change ', change)
    this.toFix[change.id].alterState(change.broken)
    this.timeLeft = change.timeLeft
    fixCounter.set(change.fixCount)
    // UI changes
  }

  protected loadFullState(fullState: FullState): void {
    log('loading full state ', fullState)
    if (fullState.active && !this.active) {
      // Start new game
      startUI(fullState.timeLeft)
    } else if (!fullState.active && this.active) {
      // finish game
    }
    playerIsTraitor = fullState.playerIsTraitor
    this.active = fullState.active
    this.timeLeft = fullState.timeLeft
    if (fixCounter) {
      fixCounter.set(fullState.fixCount)
    }

    if (playerIsTraitor) {
      log('PLAYER IS TRAITOR')
    }

    // for (let i = 0; i < this.toFix.length; i++) {
    //   this.toFix[i].adapt(playerIsTraitor)
    // }

    for (let i = 0; i < this.toFix.length; i++) {
      this.toFix[i].alterState(fullState.toFix[i].broken)
    }
  }

  resetAllGame(): void {
    movePlayerTo({ x: 1, y: 0, z: 1 }, { x: 8, y: 1, z: 8 })
    for (let i = 0; i < this.toFix.length; i++) {
      this.toFix[i].reset()
    }
  }

  countFixes(): number[] {
    let fixCount = [0, 0]
    for (let i = 0; i < this.toFix.length; i++) {
      if (this.toFix[i].broken == true) {
        fixCount[0]++
      } else {
        fixCount[1]++
      }
    }
    return fixCount
  }
}

type EquiptmentChange = {
  id: number
  broken: boolean
  timeLeft: number
  fixCount: number
}

type FullState = {
  active: boolean
  toFix: EquiptmentChange[]
  timeLeft?: number
  fixCount: number
  playerIsTraitor?: boolean
}
