import * as WebSocket from 'ws'
import { roomDictionary, MessageType, roomData, Player } from './types'
import { startCountdown } from './timer'
import {
  removeFromTeams,
  playerJoin,
  checkAlredyInTeams,
  pickTraitor,
} from './handlePlayers'
import { PORT, startBrokenArray, GAME_DURATION } from './config'

export const wss = new WebSocket.Server({ port: PORT })

export var rooms = {} as roomDictionary

export interface customWs extends WebSocket {
  room: string
}

export var CLIENTS: customWs[] = []

wss.once('listening', () => {
  console.log('Listening on port ', PORT)
})

wss.on('connection', (clientWs, request) => {
  const ws = clientWs as customWs
  ws.room = request.url || ''

  let id = new Date().getTime()
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
          playerJoin(id, msg.data, room, ws.room)
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
              timeleft: room.timeLeft,
            },
          })
        )
        break

      case MessageType.STARTVOTE:
        for (let player of room.players) {
          player.votes = []
        }

        if (room.gameActive) {
          room.gamePaused = true
          sendAllAlive(
            JSON.stringify({
              type: MessageType.STARTVOTE,
              data: {
                players: room.players,
              },
            }),
            ws.room
          )
        } else {
          console.log('no change bc room inactive')
        }
        break

      case MessageType.VOTE:
        if (room.gamePaused) {
          room.players[msg.data.voted].votes.push(msg.data.voter)

          sendAllAlive(
            JSON.stringify({
              type: MessageType.VOTE,
              data: {
                voter: msg.data.voter,
                voted: msg.data.voted,
                thumb: room.players[msg.data.voted].thumb,
              },
            }),
            ws.room
          )

          let voteCount = 0
          for (let player of room.players) {
            voteCount += player.votes.length
          }

          if (voteCount >= room.players.length) {
            endVotes(ws.room)
          } else {
            console.log(
              'We have ',
              voteCount,
              ' votes, we need ',
              room.players.length
            )
          }
        } else {
          console.log('no change bc voting not on')
        }
        break
    }
    ws.on('close', function () {
      console.log('user ' + id + ' left game')
      delete CLIENTS[id]
      removeFromTeams(id, room)
    })
  })
})

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
          timeLeft: GAME_DURATION,
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
          timeLeft: GAME_DURATION,
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

    startCountdown(room, GAME_DURATION)

    // setTimeout(function () {
    //   endGame(room)
    // }, gameDuration * 1000)
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
  rooms[room].toFix = new Array(14)
  for (let i = 0; i < rooms[room].toFix.length; i++) {
    rooms[room].toFix[i] = { id: i, broken: startBrokenArray[i] }
  }
}

export function randomBreakEquipt(room: string) {
  let attempts = 0
  let brokeSomething = false
  while (!brokeSomething) {
    let randomI = Math.floor(Math.random() * rooms[room].toFix.length)

    if (!rooms[room].toFix[randomI].broken && startBrokenArray[randomI]) {
      rooms[room].toFix[randomI].broken = true
      sendAll(
        JSON.stringify({
          type: 'Ship-singleChange',
          data: {
            id: randomI,
            broken: true,
          },
        }),
        room
      )
      brokeSomething = true
      console.log('Randomly breaking equiptment ', randomI)
    } else {
      attempts++
      if (attempts > 10) {
        brokeSomething = true
      }
    }
  }
}

export function endVotes(roomName: string) {
  let room = rooms[roomName]
  room.gameActive = true
  let mostVotesAgainst = 0
  let playerWithMostVotes = null
  for (let i = 0; i < room.players.length; i++) {
    if (room.players[i].votes.length > mostVotesAgainst) {
      mostVotesAgainst = room.players[i].votes.length
      playerWithMostVotes = i
      console.log(mostVotesAgainst, ' votes for ', i)
    } else if (room.players[i].votes.length == mostVotesAgainst) {
      playerWithMostVotes = null
      console.log("it's a tie! ", mostVotesAgainst, ' votes also for ', i)
    }
  }

  let playerToKick = null
  let isTraitor = false
  if (mostVotesAgainst > 1 && playerWithMostVotes) {
    room.players[playerWithMostVotes].alive = false
    playerToKick = room.players[playerWithMostVotes].name
    isTraitor = room.players[playerWithMostVotes].isTraitor
    console.log('We have a victim! ', playerToKick)
  }

  sendAllPlayers(
    JSON.stringify({
      type: MessageType.ENDVOTE,
      data: {
        kickedPlayer: playerToKick,
        wasTraitor: isTraitor,
      },
    }),
    roomName
  )

  console.log(playerToKick + ' was kicked out, ')
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

export async function sendAllAlive(message: WebSocket.Data, room: string) {
  rooms[room].players.forEach(function each(player) {
    if (player.alive) {
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
