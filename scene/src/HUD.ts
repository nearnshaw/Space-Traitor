import * as ui from '../node_modules/@dcl/ui-utils/index'
import { SFHeavyFont } from '../node_modules/@dcl/ui-utils/utils/default-ui-comopnents'

export let fixUIBck: ui.LargeIcon
export let fixCounter: ui.UICounter
export let secondsCounter: ui.UICounter
export let timerSeparaor: ui.CornerLabel
export let minutesCounter: ui.UICounter

export let timer: CountdownSystem

let totalFixes = 10
let firstTime: boolean = true

export function startUI(time: number) {
  if (firstTime == true) {
    fixUIBck = new ui.LargeIcon('images/ui-gem.png', -20, 50, 256, 128, {
      sourceWidth: 512,
      sourceHeight: 256,
    })
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
      secondsCounter.decrease()
      if (secondsCounter.read() < 0) {
        if (minutesCounter.read() <= 0) {
          // TIME UP
          // RESET
        } else {
          secondsCounter.set(59)
          minutesCounter.decrease()
        }
      }
    }
  }
}
