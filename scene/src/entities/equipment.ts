import { isTraitor } from '../game'

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

export enum EquiptmentType {
  CONSOLE,
  CABLES,
  OXYGEN,
  REACTOR,
}

export class Equipment extends Entity {
  broken: boolean = false
  type: EquiptmentType
  fixable: boolean
  breakable: boolean
  id: number

  constructor(
    id: number,
    transform: TranformConstructorArgs,
    type: EquiptmentType,
    changeListener: (state: boolean) => void,
    startBroken?: boolean
  ) {
    super('Equipment')

    this.id = id

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

    this.addComponent(
      new OnPointerDown(() => {
        if (isTraitor && this.breakable && !this.broken) {
          this.addComponentOrReplace(redMaterial)
          this.broken = true
        } else if (!isTraitor && this.fixable && this.broken) {
          this.addComponentOrReplace(greenMaterial)
          this.broken = false
        }
        changeListener(this.broken)
      })
    )
  }

  change(isBroken: boolean) {
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
