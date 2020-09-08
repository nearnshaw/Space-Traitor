export class Button extends Entity {
  soundClip = new AudioClip('sounds/click.mp3')

  action: () => void

  animationClip: AnimationState

  constructor(
    transform: TranformConstructorArgs,
    model: GLTFShape,
    action: () => void,
    caption: string,
    animation?: string
  ) {
    super('Equipment')
    this.addComponent(new Transform(transform))
    this.addComponent(model)
    engine.addEntity(this)

    const animator = new Animator()
    this.animationClip = new AnimationState(animation ? animation : 'trigger', {
      looping: false,
    })
    animator.addClip(this.animationClip)
    this.addComponent(animator)

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          action()
          this.play()
        },
        { hoverText: caption, distance: 5 }
      )
    )

    this.action = action
  }

  play() {
    const source = new AudioSource(this.soundClip)
    this.addComponentOrReplace(source)
    source.playing = true

    this.animationClip.stop()
    this.animationClip.play()
  }
}
