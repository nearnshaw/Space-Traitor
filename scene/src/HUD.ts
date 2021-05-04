import * as ui from '@dcl/ui-scene-utils'
import * as npc from '@dcl/npc-scene-utils'
import {music} from './musicPlayer'

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
fixCounter.uiText.font = ui.SFHeavyFont
export let secondsCounter = new ui.UICounter(0, -14, 49, Color4.Black())
secondsCounter.uiText.visible = false
export let timerSeparaor = new ui.CornerLabel(':', -39, 49, Color4.Black())
timerSeparaor.uiText.visible = false
export let minutesCounter = new ui.UICounter(0, -64, 49, Color4.Black())
minutesCounter.uiText.visible = false
secondsCounter.uiText.visible
export let satelliteUI = new npc.DialogWindow({
  path: 'images/radio3.png',
  height: 220,
  width: 220,
  offsetX: -40,
})
export let robotUI = new npc.DialogWindow({ path: 'images/robot2.png' }, true)

// export let timer: CountdownSystem

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
  timerCrytical = false

  if (firstTime == true) {
    // timer = new CountdownSystem()
    // engine.addSystem(timer)
    firstTime = false
  } else {
   
    // timer.running = true
  }
}

export let timerCrytical: boolean = false

export function updateCountdown(value:number){
  secondsCounter.set(value % 60)
  minutesCounter.set(Math.floor(value / 60))
  if (!timerCrytical && value < 90) {
    music.playSong('Space-Traitor-3.mp3', 0.5)
    timerCrytical = true
  }
}

// class CountdownSystem implements ISystem {
//   running: boolean = true
//   timer: number = 1
//   crytical: boolean = false
//   update(dt: number) {
//     if (this.running == false) return
//     this.timer -= dt
//     if (this.timer <= 0) {
//       this.timer = 1
//       ship.timeLeft -= 1
//       secondsCounter.set(ship.timeLeft % 60)
//       minutesCounter.set(Math.floor(ship.timeLeft / 60))

//       if (!this.crytical && ship.timeLeft < 90) {
//         music.playSong('Space-Traitor-3.mp3', 0.5)
//         this.crytical = true
//       }

//       if (ship.timeLeft < 0) {
//         ship.active = false
//       }
//       //   if (secondsCounter.read() < 0) {
//       //     if (minutesCounter.read() <= 0) {
//       //       // TIME UP
//       //       // RESET
//       //     } else {
//       //       secondsCounter.set(59)
//       //       minutesCounter.decrease()
//       //     }
//       //   }
//     }
//   }
// }
