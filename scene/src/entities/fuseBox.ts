import { MultiplayerEntity } from './MultiplayerEntity'
import { ship } from '../game'
import { playerIsTraitor } from './SpaceShip'

@Component('org.decentraland.CableBox')
export class CableBox {
  redCable: boolean = true
  greenCable: boolean = true
  blueCable: boolean = true
  redCableCut: boolean = false
  greenCableCut: boolean = false
  blueCableCut: boolean = false
  doorOpen: boolean = false
  constructor(
    //public channel: IChannel,
    redCable: boolean,
    greenCable: boolean,
    blueCable: boolean
  ) {
    this.redCable = redCable
    this.greenCable = greenCable
    this.blueCable = blueCable
  }
}

export enum CableColors {
  Blue,
  Green,
  Red,
}

let openAudioClip = new AudioClip('sounds/OpenChest.mp3')
let closeAudioClip = new AudioClip('sounds/CloseChest.mp3')
let sparkAudioClip = new AudioClip('sounds/Sparks_FX_03.mp3')

export class FuseBox extends MultiplayerEntity<FuseChange, FullFuseState> {
  id: number
  changeListener: (state: boolean) => void

  broken: boolean = false

  redCable: Entity
  blueCable: Entity
  greenCable: Entity
  redClip: AnimationState
  blueClip: AnimationState
  greenClip: AnimationState

  constructor(
    id: number,
    transform: TranformConstructorArgs,
    //changeListener: (state: boolean) => void,
    startBroken?: boolean
  ) {
    super('FuseBox')

    this.id = id
    //this.changeListener = changeListener

    this.addComponent(new Transform(transform))

    let boxState = new CableBox(true, true, true)
    this.addComponent(boxState)

    const animator = new Animator()
    const openClip = new AnimationState('open', { looping: false })
    const closeClip = new AnimationState('close', { looping: false })
    animator.addClip(openClip)
    animator.addClip(closeClip)
    this.addComponent(animator)

    this.addComponent(new GLTFShape('models/Cable_Box.glb'))
    engine.addEntity(this)

    if (startBroken) this.broken = true

    let thisBox = this

    this.addComponentOrReplace(
      new OnPointerDown(
        () => {
          if (boxState.doorOpen) {
            this.propagateChange({
              id: this.id,
              doorOpen: false,
            })
          } else {
            this.propagateChange({
              id: this.id,
              doorOpen: true,
            })
          }
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
          if (boxState.redCableCut === true) return
          this.propagateChange({
            id: this.id,
            redCut: true,
            isTraitor: playerIsTraitor,
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
          if (boxState.greenCableCut === true) return
          this.propagateChange({
            id: this.id,
            greenCut: true,
            isTraitor: playerIsTraitor,
          })
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Cut',
          distance: 4,
        }
      )
    )
    this.greenClip.stop()

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
          if (boxState.blueCableCut === true) return
          this.propagateChange({
            id: this.id,
            blueCut: true,
            isTraitor: playerIsTraitor,
          })
        },
        {
          button: ActionButton.POINTER,
          hoverText: 'Cut',
          distance: 4,
        }
      )
    )

    this.blueClip.stop()
  }

  reset() {
    toggleBox(this, false)
    toggleCable(this, false, CableColors.Red)
    toggleCable(this, false, CableColors.Blue)
    toggleCable(this, false, CableColors.Green)
  }

  protected reactToSingleChanges(change: FuseChange): void {
    if (change.id != this.id) return
    log('fuse gets single update ', change)

    if (`doorOpen` in change) {
      toggleBox(this, change.doorOpen)
    }

    if (`redCut` in change) {
      toggleCable(this, true, CableColors.Red)
    }
    if (`blueCut` in change) {
      toggleCable(this, true, CableColors.Blue)
    }
    if (`greenCut` in change) {
      toggleCable(this, true, CableColors.Green)
    }
  }

  protected loadFullState(fullState: FullFuseState): void {
    if (fullState.id != this.id) return
    log('fuse gets  full state ', fullState)
    ship.timeLeft = fullState.timeLeft
    toggleBox(this, fullState.doorOpen)
    toggleCable(this, fullState.redCut, CableColors.Red)
    toggleCable(this, fullState.blueCut, CableColors.Blue)
    toggleCable(this, fullState.greenCut, CableColors.Green)
  }
}

export function toggleBox(entity: Entity, value: boolean, playSound = true) {
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
  openClip.stop()
  closeClip.stop()
  const clip = value ? openClip : closeClip
  clip.play()

  boxState.doorOpen = value
}

export function toggleCable(
  entity: FuseBox,
  value: boolean,
  color: CableColors,
  playSound = true
) {
  let boxState = entity.getComponent(CableBox)
  //   if (playSound && value) {
  //     const source = new AudioSource(this.sparkSoundClip)
  //     entity.addComponentOrReplace(source)
  //     source.playing = true
  //   }

  let cableClip: AnimationState
  let animator: Animator
  switch (color) {
    case CableColors.Red:
      log('cut red calbe')
      //if (boxState.redCableCut === value) return
      //   cableClip = new AnimationState('CableRedAction', { looping: false })
      //   animator = entity.redCable.getComponent(Animator)
      //   animator.addClip(cableClip)
      cableClip = entity.redClip
      boxState.redCableCut = value
      break

    case CableColors.Green:
      //if (boxState.greenCableCut === value) return
      //   cableClip = new AnimationState('CableGreenAction', { looping: false })
      //   animator = entity.greenCable.getComponent(Animator)
      //   animator.addClip(cableClip)
      cableClip = entity.greenClip
      boxState.greenCableCut = value
      break

    case CableColors.Blue:
      //if (boxState.blueCableCut === value) return
      //   cableClip = new AnimationState('CableBlueAction', { looping: false })
      //   animator = entity.blueCable.getComponent(Animator)
      //   animator.addClip(cableClip)
      cableClip = entity.blueClip
      boxState.blueCableCut = value
      break
  }

  if (value) {
    cableClip.stop()
    cableClip.play()
  } else {
    cableClip.stop()
  }

  if (boxState.blueCableCut && boxState.redCableCut && boxState.greenCableCut) {
    // BREAK  WS MSG  ... or do on server better?
    log('ALL THREE CABLES CUT')
  }
}

// if broken, add smoke??

// sceneMessageBus.on(`openBox`, (e) => {
//   log('opening box ', e.box)
//   toggleBox(engine.entities[e.box], true, true)
// })

// sceneMessageBus.on(`closeBox`, (e) => {
//   log('closing box ', e.box)
//   toggleBox(e.box, false, true)
// })

// sceneMessageBus.on(`cutCable`, (e) => {})

type FuseChange = {
  id: number
  doorOpen?: boolean
  redCut?: boolean
  greenCut?: boolean
  blueCut?: boolean
  isTraitor?: boolean
}

type FullFuseState = {
  id: number
  doorOpen: boolean
  redCut: boolean
  greenCut: boolean
  blueCut: boolean
  timeLeft?: number
}
