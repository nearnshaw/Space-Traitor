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
  broken: boolean
  fixable: boolean
  breakable: boolean

  constructor(position: TranformConstructorArgs, type: EquiptmentType) {
    super('Equipment')
    this.addComponent(new Transform(position))
    this.addComponent(new ConeShape())
    engine.addEntity(this)

    switch (type) {
      case EquiptmentType.CONSOLE:
        this.fixable = true
        this.broken = true
        break
      case EquiptmentType.REACTOR:
        this.breakable = true
        this.broken = false
        break
    }

    this.addComponent(
      new OnPointerDown(() => {
        if (isTraitor && this.breakable && !this.broken) {
          this.addComponentOrReplace(redMaterial)
        } else if (!isTraitor && this.fixable && this.broken) {
          this.addComponentOrReplace(greenMaterial)
        }
      })
    )
  }
}
