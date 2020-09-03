import * as WebSocket from 'ws'
import { roomDictionary, MessageType, roomData, Player } from './types'

export const wss = new WebSocket.Server({ port: 8080 })

export let MINIMUM_PLAYERS = 4

export let ITEMS_IN_SHIP = 11

export let gameDuration: number = 60 * 2

export var rooms = {} as roomDictionary

export interface customWs extends WebSocket {
  room: string
}

export let startBrokenArray = [true, true, true, true, false, false]

export var CLIENTS: customWs[] = []

wss.once('listening', () => {
  console.log('Listening on port 8080')
})

wss.on('connection', (clientWs, request) => {
  const ws = clientWs as customWs
  ws.room = request.url || ''

  let id = Math.random()
  console.log('connection is established : ' + id)
  CLIENTS[id] = ws
  CLIENTS.push(ws)

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message.toString())
    console.log(msg)

    if (!rooms[ws.room]) {
      rooms[ws.room] = new roomData()
      for (let i = 0; i < rooms[ws.room].toFix.length; i++) {
        rooms[ws.room].toFix[i] = { id: i, broken: startBrokenArray[i] }
      }
    }

    let room = rooms[ws.room]

    let incomingMessageType = msg.type

    switch (incomingMessageType) {
      // PLAYER JOIN
      case MessageType.JOIN:
        if (room.gameActive == true) {
          console.log('Player denied, game in progress')
          ws.send(
            JSON.stringify({
              type: MessageType.MESSAGE,
              data: {
                text: 'Game in progress',
              },
            })
          )
          return
        } else if (checkAlredyInTeams(id, ws.room) == true) {
          console.log(
            'Player denied, already playing: ',
            msg.data.sender,
            ' existing in teams: ',
            room.players
          )
          ws.send(
            JSON.stringify({
              type: MessageType.MESSAGE,
              data: { text: 'You are already in the game' },
            })
          )
          return
        } else {
          playerJoin(id, msg, room, ws.room)
        }
        break
      // TILE CHANGE
      case 'Ship-singleChange':
        if (room.gameActive) {
          // TODO DO CHANGE
          room.toFix[msg.data.id].broken = msg.data.broken
          sendAll(message, ws.room)
          console.log('Ship changed ', room.toFix)
        } else {
          console.log('no change bc room inactive')
        }
        break
      // REQUEST SYNC
      case 'Ship-fullStateReq':
        ws.send(
          JSON.stringify({
            type: 'Ship-fullStateRes',
            data: {
              active: room.gameActive,
              toFix: room.toFix,
              playerIsTraitor: room.players[id]
                ? room.players[id].isTraitor
                : false,
              timeleft: 60,
            },
          })
          // TODO add timeLeft  & maybe blue & red score
        )
        break
    }
    ws.on('close', function () {
      console.log('user ' + id + ' left game')
      delete CLIENTS[id]
      removeFromTeams(id, room)
    })
  })
})

export function pickTraitor(room: string) {
  let rnd = Math.floor(Math.random() * 4) // rooms[room].players.length - 1)
  rooms[room].players[rnd].isTraitor = true
  rooms[room].traitors = [rnd]
  console.log(
    'Player ',
    rnd,
    ' is the traitor, id: ',
    rooms[room].players[rnd].id
  )
}

export async function newGame(room: string) {
  sendAll(
    JSON.stringify({
      type: MessageType.MESSAGE,
      data: { text: 'Game Starts in...' },
    }),
    room
  )
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '3' } }),
      room
    )
  }, 2000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '2' } }),
      room
    )
  }, 4000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '1' } }),
      room
    )
  }, 6000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: 'GO' } }),
      room
    )
  }, 8000)

  setTimeout(function () {
    pickTraitor(room)
    rooms[room].gameActive = true

    sendAllButTraitor(
      JSON.stringify({
        type: 'Ship-fullStateRes',
        data: {
          active: true,
          toFix: rooms[room].toFix,
          timeLeft: gameDuration,
          playerIsTraitor: false,
        },
      }),
      room
    )
    sendAllButTraitor(
      JSON.stringify({
        type: MessageType.MESSAGE,
        data: { text: 'One of your mates is a treacherous android.' },
      }),
      room
    )

    sendTraitor(
      JSON.stringify({
        type: 'Ship-fullStateRes',
        data: {
          active: true,
          toFix: rooms[room].toFix,
          timeLeft: gameDuration,
          playerIsTraitor: true,
        },
      }),
      room
    )
    sendTraitor(
      JSON.stringify({
        type: MessageType.MESSAGE,
        data: { text: 'You are the treasoning android!' },
      }),
      room
    )

    setTimeout(function () {
      endGame(room)
    }, gameDuration * 1000)
  }, 8000)
}

export async function endGame(room: string) {
  //   let blueScore = 0
  //   let redScore = 0

  console.log(
    'FINISHED GAME in room ',
    room,
    ' Blue: ',
    // blueScore,
    ' Red ',
    // redScore,
    'FINAL RESULT '
    //rooms[room].tiles
  )

  //   for (let i = 0; i < rooms[room].tiles.length; i++) {
  //     for (let j = 0; j < rooms[room].tiles[i].length; j++) {
  //       if (rooms[room].tiles[i][j] == tileColor.BLUE) {
  //         blueScore += 1
  //       } else if (rooms[room].tiles[i][j] == tileColor.RED) {
  //         redScore += 1
  //       }
  //     }
  //   }
  sendAll(
    JSON.stringify({
      type: MessageType.END,
      data: {},
    }),
    room
  )

  resetGame(room)
}

export async function resetGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].players = []
  rooms[room].traitors = []
  //   rooms[room].toFix = new Array(14)
}

export async function playerJoin(
  id: number,
  msg: any,
  room: roomData,
  roomName: string
) {
  let newPlayer = new Player(id, msg.data.team)

  room.players.push(newPlayer)
  console.log(msg.data.sender, ' joined the game')
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

/// SENDING

export async function sendAll(message: WebSocket.Data, room: string) {
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs
    try {
      if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
        cWs.send(message)
      }
    } catch {
      console.log("couldn't send to a user")
    }
  })
}

export async function sendAllPlayers(message: WebSocket.Data, room: string) {
  rooms[room].players.forEach(function each(player) {
    const cWs = CLIENTS[player.id] as customWs

    try {
      if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
        cWs.send(message)
      }
    } catch {
      console.log("couldn't send to a user")
    }
  })
}

export async function sendAllButTraitor(message: WebSocket.Data, room: string) {
  let traitorID = rooms[room].traitors[0]
  rooms[room].players.forEach(function each(player) {
    if (traitorID != player.id) {
      const cWs = CLIENTS[player.id] as customWs
      try {
        if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
          cWs.send(message)
        }
      } catch {
        console.log("couldn't send to a user")
      }
    }
  })
}

export async function sendTraitor(message: WebSocket.Data, room: string) {
  //wss.clients.forEach(function each(client) {
  const cWs = CLIENTS[rooms[room].traitors[0]] as customWs
  //let traitorID = rooms[room].traitors[0]
  //if (CLIENTS[traitorID] == cWs) {
  try {
    if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
      cWs.send(message)
    }
  } catch {
    console.log("couldn't send to a user")
  }
  // }
  //})
}

export async function sendPlayer(
  message: WebSocket.Data,
  room: string,
  socketId: number
) {
  const cWs = CLIENTS[socketId] as customWs
  try {
    if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
      cWs.send(message)
    }
  } catch {
    console.log("couldn't send to a user")
  }
}

export async function sendAllOthers(
  message: WebSocket.Data,
  room: string,
  socketId: number
) {
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs
    if (CLIENTS[socketId] != cWs) {
      try {
        if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
          cWs.send(message)
        }
      } catch {
        console.log("couldn't send to a user")
      }
    }
  })
}
