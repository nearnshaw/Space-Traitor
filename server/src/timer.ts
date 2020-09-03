import { rooms, endGame, randomBreakEquipt } from '.'
import { randomBreakProbability } from './config'

export function startCountdown(roomName: string, seconds: number) {
  let room = rooms[roomName]

  room.timeLeft = seconds

  const interval = setInterval(() => {
    //console.log(room.timeLeft)

    if (!room.gamePaused) {
      room.timeLeft--

      let randomBreak = Math.random()
      if (randomBreak < 1 / randomBreakProbability) {
        randomBreakEquipt(roomName)
      }

      if (room.timeLeft < 0) {
        endGame(roomName)
      }
    }
  }, 1000)
}
