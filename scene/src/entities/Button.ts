export class Button extends Entity {
  action: () => void

  constructor(transform: TranformConstructorArgs, action: () => void) {
    super('Equipment')
    this.addComponent(new Transform(transform))
    this.addComponent(new SphereShape())
    engine.addEntity(this)

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          action()
        },
        { hoverText: 'Emergency meeting' }
      )
    )

    this.action = action
  }
}
