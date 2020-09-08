import { MultiplayerEntity } from './MultiplayerEntity'
import { Equipment } from './equipment'
import { EquiptmentData, MessageType } from '../types'
import { Button } from './Button'
import { startUI, fixCounter, satelliteUI, robotUI } from '../HUD'
import { EvilRobotBrief } from '../dialogs'
import { resetAllBoxes } from './fuseBox'

export let playerIsTraitor: boolean = false
export let playerIsAlive: boolean = true

let equiptMentList: EquiptmentData[] = [
  {
    transform: { position: new Vector3(14.5, 1, 19.6) }, startBroken: true
  },
  {
    transform: { position: new Vector3(18, 1, 6) }, startBroken: true
  },
  {
    transform: { position: new Vector3(11, 1, 33.8) }, startBroken: true
  },
  {
    transform: { position: new Vector3(33, 1, 27) }, startBroken: true
  },
  {
    transform: { position: new Vector3(26, 1, 12) }, startBroken: true
  },
  {
    transform: { position: new Vector3(35, 1, 2) }, startBroken: true
  },
  {
    transform: { position: new Vector3(21.5, 6, 9.5) }, startBroken: true
  },
  {
    transform: { position: new Vector3(34, 1, 38.8) }, startBroken: true
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
        position: new Vector3(12, 1, 28),
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
      playerIsTraitor = fullState.playerIsTraitor
      if (fullState.playerIsTraitor) {
        satelliteUI.closeDialogWindow()
        robotUI.openDialogWindow(EvilRobotBrief, 0)
      }

      //resetAllBoxes()
    } else if (!fullState.active && this.active) {
      // finish game
    }
    for (let i = 0; i < this.toFix.length; i++) {
      this.toFix[i].alterState(fullState.toFix[i].broken)
    }

    this.active = fullState.active
    this.timeLeft = fullState.timeLeft
    if (fixCounter) {
      fixCounter.set(fullState.fixCount)
    }

    if (playerIsTraitor) {
      log('PLAYER IS TRAITOR')
    }
  }

  resetAllGame(): void {
    movePlayerTo({ x: 1, y: 0, z: 1 }, { x: 8, y: 1, z: 8 })
    for (let i = 0; i < this.toFix.length; i++) {
      this.toFix[i].reset()
    }
    resetAllBoxes()
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
