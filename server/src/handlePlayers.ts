import { roomData, Player, MessageType } from './types'
import { newGame, sendPlayer, rooms } from '.'
import { MINIMUM_PLAYERS } from './config'

export async function playerJoin(
  id: number,
  data: any,
  room: roomData,
  roomName: string
) {
  let newPlayer = new Player(id, data.sender, data.thumb ? data.thumb : null)

  room.players.push(newPlayer)
  console.log(data.sender, ' joined the game')
  if (room.players.length >= MINIMUM_PLAYERS) {
    // with enough players, start game
    newGame(roomName)
    console.log('New game starting! with ', room.players)
  } else {
    sendPlayer(
      JSON.stringify({
        type: MessageType.MESSAGE,
        data: {
          text:
            room.players.length +
            ' Players are ready \n' +
            'You need at least ' +
            MINIMUM_PLAYERS +
            ' to start a game.\n Invite your friends/nemesis!',
        },
      }),
      roomName,
      newPlayer.id
    )
  }
}

export function checkAlredyInTeams(player: number, room: string) {
  for (let i = 0; i < rooms[room].players.length; i++) {
    if (rooms[room].players[i].id == player) {
      return true
    }
  }
  return false
}

export function removeFromTeams(player: number, room: roomData) {
  for (let i = 0; i < room.players.length; i++) {
    if (room.players[i].id == player) {
      room.players = room.players.splice(i, 1)
    }
  }
}

export function pickTraitor(room: string) {
  let rnd = Math.floor(Math.random() * MINIMUM_PLAYERS) // rooms[room].players.length - 1)
  rooms[room].players[rnd].isTraitor = true
  rooms[room].traitors = [rnd]
  console.log(
    'Player ',
    rnd,
    ' , ',
    rooms[room].players[rnd].name,
    ' is the traitor, id: ',
    rooms[room].players[rnd].id
  )
}
