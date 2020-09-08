export class Siren {
    animator: Animator
    deactivateClip: AnimationState
    activateClip: AnimationState
    entity: Entity
    transform: Transform
  
    constructor(parentEntity: Entity, localPosition: Vector3) {
      this.entity = new Entity(parentEntity.name + '-button')
      this.entity.setParent(parentEntity)
  
      this.animator = new Animator()
      this.deactivateClip = new AnimationState('deactivate', { looping: true })
      this.activateClip = new AnimationState('activate', { looping: true })
      this.animator.addClip(this.deactivateClip)
      this.animator.addClip(this.activateClip)
      this.entity.addComponent(this.animator)
      this.deactivateClip.play()

      this.entity.addComponent(new Transform({ position: localPosition }))
  
      this.entity.addComponent(new GLTFShape('models/Siren.glb'))
    }
  
    toggle(value: boolean) {
      this.activateClip.stop()
      this.deactivateClip.stop()
      const clip = value ? this.activateClip : this.deactivateClip
      clip.play()
    }
  }