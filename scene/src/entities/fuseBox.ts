
import { playerIsTraitor } from './SpaceShip'
import { robotUI } from '../HUD'
import { EvilRobotTips } from '../dialogs'
import { Room } from 'colyseus.js'
import { FuseChange } from 'src/types'

@Component('org.decentraland.CableBox')
export class CableBox {
  redCableCut: boolean = false
  greenCableCut: boolean = false
  blueCableCut: boolean = false
  doorOpen: boolean = false
}

// const fuseBoxes = engine.getComponentGroup(CableBox)

export enum CableColors {
  Blue,
  Green,
  Red,
}

let openAudioClip = new AudioClip('sounds/OpenChest.mp3')
let closeAudioClip = new AudioClip('sounds/CloseChest.mp3')
let sparkAudioClip = new AudioClip('sounds/Sparks_FX_03.mp3')

export class FuseBox extends Entity {
  id: number
  changeListener: (state: boolean) => void

  redCable: Entity
  blueCable: Entity
  greenCable: Entity
  redClip: AnimationState
  blueClip: AnimationState
  greenClip: AnimationState
  openClip: AnimationState
  closeClip: AnimationState
  public room: Room
  constructor(
    id: number,
    transform: TranformConstructorArgs,
    room: Room
    //changeListener: (state: boolean) => void,
  ) {
    super('FuseBox')

    this.id = id
    this.room = room
    //this.changeListener = changeListener

    this.addComponent(new Transform(transform))

    let boxState = new CableBox()
    this.addComponent(boxState)

    const animator = new Animator()
    this.openClip = new AnimationState('open', { looping: false })
    this.closeClip = new AnimationState('close', { looping: false })
    animator.addClip(this.openClip)
    animator.addClip(this.closeClip)
    this.addComponent(animator)

    this.addComponent(new GLTFShape('models/Cable_Box.glb'))
    engine.addEntity(this)

 
    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          let data:FuseChange
          if (boxState.doorOpen) {
            data = {
              id: this.id,
              doorOpen: false,
            }
          } else {
            data = {
              id: this.id,
              doorOpen: true,
            }
          }
          room.send("FuseBoxChange",data)
          //boxState.doorOpen = !boxState.doorOpen
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Open/Close',
          distance: 4,
        }
      )
    )

    this.redCable = new Entity()
    this.redCable.setParent(this)

    this.redCable.addComponent(
      new Transform({
        position: new Vector3(-0.21, 0.15, -0.25),
      })
    )
    this.redClip = new AnimationState('CableRedAction', { looping: false })
    this.redCable.addComponent(new Animator()).addClip(this.redClip)
    this.redCable.addComponent(new GLTFShape('models/RedCable.glb'))
    this.redCable.addComponent(
      new OnPointerDown(
        (e) => {
          if (!boxState.doorOpen || boxState.redCableCut) return
          room.send("FuseBoxChange",{
            id: this.id,
            redCut: true,
            //isTraitor: playerIsTraitor,
          } )
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Cut',
          distance: 4,
        }
      )
    )

    this.greenCable = new Entity()
    this.greenCable.setParent(this)

    this.greenCable.addComponent(
      new Transform({
        position: new Vector3(0, 0.15, -0.25),
      })
    )
    this.greenClip = new AnimationState('CableGreenAction', {
      looping: false,
    })
    this.greenCable.addComponent(new Animator()).addClip(this.greenClip)
    this.greenCable.addComponent(new GLTFShape('models/GreenCable.glb'))
    this.greenCable.addComponent(
      new OnPointerDown(
        (e) => {
          if (!boxState.doorOpen || boxState.greenCableCut) return
          room.send("FuseBoxChange",{
            id: this.id,
            greenCut: true,
          })
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Cut',
          distance: 4,
        }
      )
    )

    this.blueCable = new Entity()
    this.blueCable.setParent(this)

    this.blueCable.addComponent(
      new Transform({
        position: new Vector3(0.21, 0.15, -0.25),
      })
    )
    this.blueClip = new AnimationState('CableBlueAction', { looping: false })
    this.blueCable.addComponent(new Animator()).addClip(this.blueClip)
    this.blueCable.addComponent(new GLTFShape('models/BlueCable.glb'))
    this.blueCable.addComponent(
      new OnPointerDown(
        (e) => {
          if (!boxState.doorOpen || boxState.blueCableCut) return
          room.send("FuseBoxChange",{
            id: this.id,
            blueCut: true,
          })
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Cut',
          distance: 4,
        }
      )
    )

    this.redClip.stop()
    this.greenClip.stop()
    this.blueClip.stop()

    this.getComponent(CableBox).blueCableCut = false
    this.getComponent(CableBox).redCableCut = false
    this.getComponent(CableBox).greenCableCut = false
    this.getComponent(CableBox).doorOpen = false

    return
  }

  reset() {
    this.redClip.reset()
    this.greenClip.reset()
    this.blueClip.reset()
    this.openClip.reset()

    this.getComponent(CableBox).blueCableCut = false
    this.getComponent(CableBox).redCableCut = false
    this.getComponent(CableBox).greenCableCut = false
    this.getComponent(CableBox).doorOpen = false
  }

  // protected reactToSingleChanges(change: FuseChange): void {
  //   if (change.id != this.id) return
  //   log('fuse gets single update ', change)

  //   if (`doorOpen` in change) {
  //     toggleBox(this, change.doorOpen)
  //   }

  //   if (`redCut` in change) {
  //     toggleCable(this, true, CableColors.Red)
  //   }
  //   if (`blueCut` in change) {
  //     toggleCable(this, true, CableColors.Blue)
  //   }
  //   if (`greenCut` in change) {
  //     toggleCable(this, true, CableColors.Green)
  //   }
  // }

}

export function toggleBox(entity: FuseBox, value: boolean, playSound = true) {
  let boxState = entity.getComponent(CableBox)
  if (boxState.doorOpen === value) return

  if (playSound) {
    const source = value
      ? new AudioSource(openAudioClip)
      : new AudioSource(closeAudioClip)
    entity.addComponentOrReplace(source)
    //source.volume = 0.3
    source.playing = true
  }

  const animator = entity.getComponent(Animator)
  const openClip = new AnimationState('open', { looping: false })
  const closeClip = new AnimationState('close', { looping: false })
  animator.addClip(openClip)
  animator.addClip(closeClip)
  const clip = value ? openClip : closeClip
  clip.play()

  boxState.doorOpen = value


  // toggleCable(entity, boxState.redCableCut, CableColors.Red)
  // toggleCable(entity, boxState.blueCableCut, CableColors.Blue)
  // toggleCable(entity, boxState.greenCableCut, CableColors.Green)
}

export function toggleCable(
  entity: FuseBox,
  value: boolean,
  color: CableColors,
) {
  let boxState = entity.getComponent(CableBox)

  let cableClip: AnimationState
  switch (color) {
    case CableColors.Red:
      log('cut red calbe')
      cableClip = entity.redClip
      boxState.redCableCut = value
      break

    case CableColors.Green:
      cableClip = entity.greenClip
      boxState.greenCableCut = value
      break

    case CableColors.Blue:
      cableClip = entity.blueClip
      boxState.blueCableCut = value
      break
  }

  if (value == true) {
    cableClip.play(true)
  } else {
    cableClip.reset()
  }

}

// if broken, add smoke??

