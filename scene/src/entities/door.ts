import * as utils from '@dcl/ecs-scene-utils'

export class Door extends Entity {
  openSound = new AudioClip('sounds/open.mp3')
  closeSound = new AudioClip('sounds/close.mp3')
  closedState: Vector3
  openState: Vector3

  constructor(
    transform: TranformConstructorArgs,
    model: GLTFShape,
    shift: Vector3,
    speed?: number
  ) {
    super('Equipment')
    this.addComponent(new Transform(transform))
    this.addComponent(model)
    engine.addEntity(this)

    this.closedState = transform.position
    this.openState = transform.position.add(shift)

    this.addComponent(
      new utils.ToggleComponent(utils.ToggleState.Off, (value) => {
        if (value == utils.ToggleState.On) {
          this.addComponentOrReplace(
            new utils.MoveTransformComponent(
              this.closedState,
              this.openState,
              speed ? speed : 1
            )
          )
        } else {
          this.addComponentOrReplace(
            new utils.MoveTransformComponent(
              this.openState,
              this.closedState,
              speed ? speed : 1
            )
          )
        }
      })
    )
  }

  open() {
    this.getComponent(utils.ToggleComponent).set(utils.ToggleState.On)
    const source = new AudioSource(this.openSound)
    this.addComponentOrReplace(source)
    source.playing = true
  }

  close() {
    this.getComponent(utils.ToggleComponent).set(utils.ToggleState.Off)
    const source = new AudioSource(this.closeSound)
    this.addComponentOrReplace(source)
    source.playing = true
  }
}
