import { playerIsTraitor } from './SpaceShip'
import { fixCounter, minutesCounter, robotUI, satelliteUI } from '../HUD'
import * as ui from '@dcl/ui-scene-utils'
import { MiniGameMachine } from '../minigames/MiniGameMachine'
import { EvilRobotTips, MissionControlTips } from '../dialogs'
import { Siren } from './Siren'
import { server } from 'game'

//Reusable materials
// export let neutralMaterial = new Material()
// neutralMaterial.roughness = 1.0
// neutralMaterial.albedoColor = Color3.FromInts(400, 250, 100) // Amber glow

// let greenMaterial = new Material()
// greenMaterial.roughness = 1
// greenMaterial.albedoColor = Color3.Green()

// let redMaterial = new Material()
// redMaterial.roughness = 1
// redMaterial.albedoColor = Color3.FromInts(500, 150, 180) // Pink glow

let firstFix:boolean = true

export class Equipment extends Entity {
  broken: boolean = false
  id: number
  miniGameMachine: MiniGameMachine
  siren: Siren
  changeListener: (state: boolean) => void

  fixSound = new AudioClip('sounds/console.mp3')
  constructor(
    id: number,
    transform: TranformConstructorArgs,
    changeListener: (state: boolean) => void,
    startBroken?: boolean
  ) {
    super('Equipment')

    this.id = id
    this.changeListener = changeListener

    this.addComponent(new Transform(transform))
    this.addComponent(new GLTFShape('models/TerminalWall.glb'))
    engine.addEntity(this)

    this.siren = new Siren(this, {
      position: new Vector3(0.5, 1.6, 0),
      rotation: Quaternion.Euler(0, 0, 90),
    })

    this.miniGameMachine = this.addComponent(
      new MiniGameMachine(
        this,
        () => {
          // this.alterState(false)
          this.changeListener(false)
          if(firstFix){
            firstFix = false
            satelliteUI.openDialogWindow(MissionControlTips, 'firstFix')
          }
          // server.send("shipChange",{ id: this.id, broken: false})
        },
        false
      )
    )

    // this.alterState(startBroken)
    this.changeListener(startBroken)

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          if (this.broken) {
            if (playerIsTraitor) {
              robotUI.openDialogWindow(EvilRobotTips, 1)
              return
            }
            this.miniGameMachine.minigame.Start()
          } else {
            log('Already fixed')
          }
        },
        {
          hoverText: playerIsTraitor ? 'Human stuff' : 'Fix',
          distance: 4,
        }
      )
    )
  }

  alterState(isBroken: boolean) {
    // if (this.broken != isBroken) {
    //   if (isBroken) {
    //     this.addComponentOrReplace(redMaterial)
    //   } else {
    //     this.addComponentOrReplace(greenMaterial)
    //   }
    // }
    this.broken = isBroken

    this.siren.toggle(this.broken)

    if (!isBroken) {
      const source = new AudioSource(this.fixSound)
      this.addComponentOrReplace(source)
      source.playing = true

     
    }
  }

  reset() {
    this.alterState(true)
  }
}
