import { ship } from '../game'
import { playerIsTraitor } from './SpaceShip'
import { fixCounter, minutesCounter, robotUI } from '../HUD'
import * as ui from '../../node_modules/@dcl/ui-utils/index'
import { MiniGameMachine } from '../minigames/MiniGameMachine'
import { EvilRobotTips } from '../dialogs'
import { Siren } from './Siren'

//Reusable materials
export let neutralMaterial = new Material()
neutralMaterial.roughness = 1.0
neutralMaterial.albedoColor = Color3.FromInts(400, 250, 100) // Amber glow

let greenMaterial = new Material()
greenMaterial.roughness = 1
greenMaterial.albedoColor = Color3.Green()

let redMaterial = new Material()
redMaterial.roughness = 1
redMaterial.albedoColor = Color3.FromInts(500, 150, 180) // Pink glow

export class Equipment extends Entity {
  broken: boolean = false
  id: number
  miniGameMachine: MiniGameMachine
  siren: Siren
  changeListener: (state: boolean) => void

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

    this.siren = new Siren(this, { position: new Vector3(0.5, 2, 0), rotation: Quaternion.Euler(0, 0, 90), })

    this.miniGameMachine = this.addComponent(
      new MiniGameMachine(
        this,
        () => {
          this.alterState(false)
          this.changeListener(false)
        },
        false
      )
    )

    this.alterState(startBroken)
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
    if (this.broken != isBroken) {
      if (isBroken) {
        this.addComponentOrReplace(redMaterial)
      } else {
        this.addComponentOrReplace(greenMaterial)
      }
    }
    this.broken = isBroken

    this.siren.toggle(this.broken)
  }

  reset() {
    this.alterState(true)
  }
}
