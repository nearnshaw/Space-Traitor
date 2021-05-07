export class Siren {
  animator: Animator
  deactivateClip: AnimationState
  activateClip: AnimationState
  entity: Entity
  transform: Transform

  constructor(parentEntity: Entity, transform: TranformConstructorArgs) {
    this.entity = new Entity(parentEntity.name + '-button')
    this.entity.setParent(parentEntity)

    this.animator = new Animator()
    this.deactivateClip = new AnimationState('deactivate', { looping: true })
    this.activateClip = new AnimationState('activate', { looping: true })
    this.animator.addClip(this.deactivateClip)
    this.animator.addClip(this.activateClip)
    this.entity.addComponent(this.animator)
    this.deactivateClip.play()

    this.entity.addComponent(new Transform(transform))

    this.entity.addComponent(new GLTFShape('models/Siren.glb'))
  }

  toggle(value: boolean) {
    this.activateClip.stop()
    this.deactivateClip.stop()
    // this.deactivateClip = new AnimationState('deactivate', { looping: true })
    // this.activateClip = new AnimationState('activate', { looping: true })
    const clip = value ? this.activateClip : this.deactivateClip
    clip.play()
  }
}
