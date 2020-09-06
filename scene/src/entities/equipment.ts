import { ship } from '../game'
import { playerIsTraitor } from './SpaceShip'
import { fixCounter, minutesCounter, robotUI } from '../HUD'
import * as ui from '../../node_modules/@dcl/ui-utils/index'
import { MiniGameMachine } from '../minigames/MiniGameMachine'
import { EvilRobotTips } from '../dialogs'

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
  //type: EquiptmentType
  //   fixable: boolean
  //   breakable: boolean
  id: number
  miniGameMachine: MiniGameMachine
  changeListener: (state: boolean) => void

  constructor(
    id: number,
    transform: TranformConstructorArgs,
    //type: EquiptmentType,
    changeListener: (state: boolean) => void,
    startBroken?: boolean
  ) {
    super('Equipment')

    this.id = id
    this.changeListener = changeListener

    this.addComponent(new Transform(transform))
    this.addComponent(new ConeShape())
    engine.addEntity(this)

    this.miniGameMachine = this.addComponent(
      new MiniGameMachine(
        this,
        () => {
          this.alterState(false)
          this.changeListener(this.broken)
        },
        false
      )
    )

    this.alterState(startBroken)

    if (this.broken) {
      this.addComponentOrReplace(redMaterial)
    } else {
      this.addComponentOrReplace(greenMaterial)
    }

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          if (this.broken) {
            if (playerIsTraitor) {
              robotUI.openDialogWindow(EvilRobotTips, 0)
              return
            }
            this.miniGameMachine.minigame.Start()
          }
        },
        {
          hoverText: 'Fix',
        }
      )
    )
  }

  alterState(isBroken: boolean) {
    //log('Equip was broken :', this.broken, ' and now is broken: ', isBroken)
    if (this.broken != isBroken) {
      if (isBroken) {
        this.addComponentOrReplace(redMaterial)
        //minutesCounter.decrease()
      } else {
        this.addComponentOrReplace(greenMaterial)
        //fixCounter.increase()
      }
    }
    this.broken = isBroken

    // this.changeListener(this.broken)
  }

  reset() {
    this.broken = true
    // switch (this.type) {
    //   case EquiptmentType.CONSOLE:
    //     this.fixable = true
    //     this.broken = true
    //     break
    //   case EquiptmentType.REACTOR:
    //     this.breakable = true
    //     this.broken = false
    //     break
    // }
  }
}
