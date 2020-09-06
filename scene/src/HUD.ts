import * as ui from '../node_modules/@dcl/ui-utils/index'
import { SFHeavyFont } from '../node_modules/@dcl/ui-utils/utils/default-ui-comopnents'
import { ship } from './game'
import { MissionControlBrief, EvilRobotBrief } from './dialogs'

export let fixUIBck: ui.LargeIcon
export let fixIcon: ui.LargeIcon
export let fixCounter: ui.UICounter
export let secondsCounter: ui.UICounter
export let timerSeparaor: ui.CornerLabel
export let minutesCounter: ui.UICounter

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
  if (firstTime == true) {
    fixUIBck = new ui.LargeIcon('images/ui-gem.png', -20, 50, 256, 128, {
      sourceWidth: 512,
      sourceHeight: 256,
    })
    fixIcon = new ui.LargeIcon(
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
    //let gemsLabel = new ui.CornerLabel('Gems found:', -100, 50, Color4.Purple())
    fixCounter = new ui.UICounter(0, -135, 105, Color4.Purple(), 48, true)
    fixCounter.uiText.font = SFHeavyFont
    secondsCounter = new ui.UICounter(0, -14, 49, Color4.Black())
    timerSeparaor = new ui.CornerLabel(':', -39, 49, Color4.Black())
    minutesCounter = new ui.UICounter(time / 60, -64, 49, Color4.Black())
    timer = new CountdownSystem()
    engine.addSystem(timer)
    firstTime = false
  } else {
    fixCounter.set(0)
    secondsCounter.set(0)
    minutesCounter.set(5)
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
