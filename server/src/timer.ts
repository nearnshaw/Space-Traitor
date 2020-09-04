import { rooms, endGame, randomBreakEquipt } from '.'
import { randomBreakProbability } from './config'

export function startCountdown(roomName: string, seconds: number) {
  let room = rooms[roomName]

  room.timeLeft = seconds

  const interval = setInterval(() => {
    if (!room.gamePaused) {
      room.timeLeft--
      console.log(room.timeLeft)

      let randomBreak = Math.random()
      if (randomBreak < 1 / randomBreakProbability) {
        randomBreakEquipt(roomName)
      }

      if (room.timeLeft < 0) {
        endGame(roomName)
        room.gameActive = false
        clearInterval(interval)
      }
    }
  }, 1000)
}
