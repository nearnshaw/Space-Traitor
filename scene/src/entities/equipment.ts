import { ship } from '../game'
import { playerIsTraitor } from './SpaceShip'
import { EquiptmentType } from '../types'
import { fixCounter, minutesCounter } from '../HUD'

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
  type: EquiptmentType
  fixable: boolean
  breakable: boolean
  id: number
  changeListener: (state: boolean) => void

  constructor(
    id: number,
    transform: TranformConstructorArgs,
    type: EquiptmentType,
    changeListener: (state: boolean) => void,
    startBroken?: boolean
  ) {
    super('Equipment')

    this.id = id
    this.changeListener = changeListener

    this.addComponent(new Transform(transform))
    this.addComponent(new ConeShape())
    engine.addEntity(this)

    this.type = type
    this.reset()

    if (this.broken) {
      this.addComponentOrReplace(redMaterial)
    } else {
      this.addComponentOrReplace(greenMaterial)
    }

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          log('clicked by ', playerIsTraitor ? 'traitor' : 'crew memeber')
          if (playerIsTraitor && this.breakable && !this.broken) {
            // BREAK
            this.changeListener(true)
          } else if (!playerIsTraitor && this.fixable && this.broken) {
            // FIX
            this.changeListener(false)
          }
        },
        {
          hoverText: playerIsTraitor ? 'Break' : 'Fix',
        }
      )
    )
  }

  alterState(isBroken: boolean) {
    log('Equip was broken :', this.broken, ' and now is broken: ', isBroken)
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
  }

  reset() {
    switch (this.type) {
      case EquiptmentType.CONSOLE:
        this.fixable = true
        this.broken = true
        break
      case EquiptmentType.REACTOR:
        this.breakable = true
        this.broken = false
        break
    }
  }
}
