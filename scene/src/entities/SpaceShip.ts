
import { Equipment } from './equipment'
import * as utils from '@dcl/ecs-scene-utils'
import { Button } from './Button'

import { Door } from './door'

import { EquiptmentChange, EquiptmentData } from 'src/types'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import { Room } from 'colyseus.js'



let equiptMentList: EquiptmentData[] = [
  {
    transform: { position: new Vector3(15.2, 1, 19) },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(24, 1, 7.2),
      rotation: Quaternion.Euler(0, 270, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(12, 1, 33),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(36.4, 1, 31.2),
      rotation: Quaternion.Euler(0, 270, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(25, 1, 12),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(35, 1, 0.9),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(21.5, 5.3, 8.9),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    startBroken: true,
  },
  {
    transform: {
      position: new Vector3(36.4, 1, 39.4),
      rotation: Quaternion.Euler(0, 270, 0),
    },
    startBroken: true,
  },
]

export class SpaceShip extends Entity {
  public toFix: Equipment[] = []
  // public toSabbotage: Equipment[]
  public active: boolean = false
  public timeLeft: number
  public room: Room

  constructor(room: Room) {
    super('Ship')
    engine.addEntity(this)

    this.room = room

    for (let i = 0; i < equiptMentList.length; i++) {
      let eq = new Equipment(
        i,
        equiptMentList[i].transform,
        (state) => {

          let data: EquiptmentChange = {
            id: i,
            broken: state
          }
          room.send("shipChange", data)
        },
        equiptMentList[i].startBroken
      )
      this.toFix.push(eq)
    }

    let buttonPedestal = new Entity()
    buttonPedestal.addComponent(
      new Transform({
        position: new Vector3(24, 0, 18),
        rotation: Quaternion.Euler(0, 90, 0),
        scale: new Vector3(1.5, 1.5, 1.5),
      })
    )
    buttonPedestal.addComponent(new GLTFShape('models/Pedestal.glb'))
    engine.addEntity(buttonPedestal)

    let panicButton = new Button(
      {
        position: new Vector3(24, 1.5, 18.1),
        rotation: Quaternion.Euler(0, 90, 30),
        scale: new Vector3(1.5, 1.5, 1.5),
      },
      new GLTFShape('models/Danger_SciFi_Button.glb'),
      () => {
        room.send("startvote")
      },
      'Emergency Meeting'
    )
  }


  reactToSingleChanges(change: EquiptmentChange): void {
    log('reacting to single change ', change)
    this.toFix[change.id].alterState(change.broken)
  }

  // protected loadFullState(fullState: FullState): void {
  //   log('loading full state ', fullState)
    // if (fullState.active && !this.active) {
    //   // Start new game
    //   startUI(fullState.timeLeft)
    //   playerIsTraitor = fullState.playerIsTraitor
    //   if (fullState.playerIsTraitor) {
    //     if (satelliteUI.isDialogOpen) {
    //       satelliteUI.closeDialogWindow()
    //     }
    //     robotUI.openDialogWindow(EvilRobotBrief, 0)
    //   }
    //   mainDoor.open()
    //   utils.setTimeout(30000, () => {
    //     mainDoor.close()
    //   })

    //   music.playSong('Space-Traitor-2.mp3', 0.25)

    //   //resetAllBoxes()
    // } else if (!fullState.active && this.active) {
    //   // finish game
    //   //mainDoor.open()
    // }
    // for (let i = 0; i < this.toFix.length; i++) {
    //   this.toFix[i].alterState(fullState.toFix[i].broken)
    // }

    // this.active = fullState.active
    // this.timeLeft = fullState.timeLeft
    // if (fixCounter) {
    //   fixCounter.set(fullState.fixCount)
    // }

    // if (playerIsTraitor) {
    //   log('PLAYER IS TRAITOR')
    // }
  // }

  resetShip(): void {
    movePlayerTo({ x: 1, y: 0, z: 1 }, { x: 8, y: 1, z: 8 })
    for (let i = 0; i < this.toFix.length; i++) {
      this.toFix[i].reset()
    }
  }
}

export let playerIsTraitor: boolean = false
export let playerIsAlive: boolean = true

export function setPlayerIsTraitor(value:boolean){
  playerIsTraitor = value
}

export function setPlayerIsAlive(value:boolean){
  playerIsAlive = value
}

export let mainDoor = new Door(
  {
    position: new Vector3(4.5, 0, 4.3),
    rotation: Quaternion.Euler(0, 45 + 90, 0),
  },
  new GLTFShape('models/MainDoor.glb'),
  new Vector3(2, 0, -2)
)

// mainDoor.open()
