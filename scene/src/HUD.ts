import * as ui from '../node_modules/@dcl/ui-utils/index'
import { SFHeavyFont } from '../node_modules/@dcl/ui-utils/utils/default-ui-comopnents'
import { ship } from './game'
import { MissionControlBrief, EvilRobotBrief } from './dialogs'

export let fixUIBck = new ui.LargeIcon('images/ui-gem.png', -20, 50, 256, 128, {
  sourceWidth: 512,
  sourceHeight: 256,
})
fixUIBck.image.visible = false
export let fixIcon = new ui.LargeIcon(
  'images/tool2.png',
  -210,
  65,
  128 * 0.92,
  128 * 0.92,
  {
    sourceWidth: 128,
    sourceHeight: 128,
  }
)
fixIcon.image.visible = false
export let fixCounter = new ui.UICounter(
  0,
  -135,
  105,
  Color4.Purple(),
  48,
  true
)
fixCounter.uiText.visible = false
fixCounter.uiText.font = SFHeavyFont
export let secondsCounter = new ui.UICounter(0, -14, 49, Color4.Black())
secondsCounter.uiText.visible = false
export let timerSeparaor = new ui.CornerLabel(':', -39, 49, Color4.Black())
timerSeparaor.uiText.visible = false
export let minutesCounter = new ui.UICounter(0, -64, 49, Color4.Black())
minutesCounter.uiText.visible = false

export let satelliteUI = new ui.DialogWindow({
  path: 'images/radio3.png',
  height: 220,
  width: 220,
  offsetX: -40,
})
export let robotUI = new ui.DialogWindow({ path: 'images/robot2.png' }, true)

export let timer: CountdownSystem

let totalFixes = 10
let firstTime: boolean = true

export function startUI(time: number) {
  fixUIBck.image.visible = true
  fixIcon.image.visible = true
  fixCounter.uiText.visible = true
  secondsCounter.uiText.visible = true
  timerSeparaor.uiText.visible = true
  minutesCounter.uiText.visible = true
  fixCounter.set(0)
  secondsCounter.set(time % 60)
  minutesCounter.set(time / 60)

  if (firstTime == true) {
    timer = new CountdownSystem()
    engine.addSystem(timer)
    firstTime = false
  } else {
    timer.running = true
  }
}

class CountdownSystem implements ISystem {
  running: boolean = true
  timer: number = 1
  update(dt: number) {
    if (this.running == false) return
    this.timer -= dt
    if (this.timer <= 0) {
      this.timer = 1
      ship.timeLeft -= 1
      secondsCounter.set(ship.timeLeft % 60)
      minutesCounter.set(Math.floor(ship.timeLeft / 60))

      if (ship.timeLeft < 0) {
        ship.active = false
      }
      //   if (secondsCounter.read() < 0) {
      //     if (minutesCounter.read() <= 0) {
      //       // TIME UP
      //       // RESET
      //     } else {
      //       secondsCounter.set(59)
      //       minutesCounter.decrease()
      //     }
      //   }
    }
  }
}
