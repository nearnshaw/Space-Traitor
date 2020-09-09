import * as WebSocket from 'ws'
import { roomDictionary, MessageType, roomData, Player } from './types'
import { startCountdown } from './timer'
import {
  removeFromTeams,
  playerJoin,
  checkAlredyInTeams,
  pickTraitor,
} from './handlePlayers'
import {
  PORT,
  startBrokenArray,
  GAME_DURATION,
  sabotagePenalty,
  FIXES_TO_WIN,
  VOTING_TIME,
} from './config'

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

  let votingTimeout: NodeJS.Timeout

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message.toString())
    console.log(msg)

    if (!rooms[ws.room]) {
      rooms[ws.room] = new roomData()
      for (let i = 0; i < rooms[ws.room].toFix.length; i++) {
        rooms[ws.room].toFix[i] = {
          id: i,
          broken: startBrokenArray[i],

          //     ? EquiptmentType.REACTOR
          //     : EquiptmentType.CONSOLE,
        }
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
      // EQUIPTMENT CHANGE
      case 'Ship-singleChange':
        if (room.gameActive) {
          room.toFix[msg.data.id].broken = msg.data.broken

          if (!msg.data.broken) {
            room.fixCount += 1
            if (room.fixCount >= FIXES_TO_WIN) {
              endGame(ws.room)
            }
          }

          sendAll(
            JSON.stringify({
              type: 'Ship-singleChange',
              data: {
                id: msg.data.id,
                broken: msg.data.broken,
                timeLeft: room.timeLeft,
                fixCount: room.fixCount,
              },
            }),
            ws.room
          )
          console.log('Ship changed ', room.toFix)
        } else {
          console.log('no change bc room inactive')
        }
        break
      // REQUEST SYNC
      case 'Ship-fullStateReq':
        let playerIndex = 0
        for (let i = 0; i > room.players.length; i++) {
          if (id == room.players[i].id) {
            playerIndex = i
          }
        }
        ws.send(
          JSON.stringify({
            type: 'Ship-fullStateRes',
            data: {
              active: room.gameActive,
              toFix: room.toFix,
              playerIsTraitor: room.players[playerIndex]
                ? room.players[playerIndex].isTraitor
                : false,
              timeLeft: room.timeLeft,
              fixCount: room.fixCount,
            },
          })
        )
        break

      case 'FuseBox-fullStateReq':
        ws.send(
          JSON.stringify({
            type: 'FuseBox-fullStateRes',
            data: {
              id: msg.data.id,
              doorOpen: room.fuseBoxes[msg.data.id].doorOpen,
              redCut: true,
              greenCut: true,
              blueCut: true,
              timeLeft: room.timeLeft,
            },
          })
        )
        break

      case 'FuseBox-singleChange':
        if (room.gameActive) {
          if (`doorOpen` in msg.data) {
            room.fuseBoxes[msg.data.id].doorOpen = msg.data.doorOpen
            sendAll(
              JSON.stringify({
                type: 'FuseBox-singleChange',
                data: msg.data,
              }),
              ws.room
            )
          } else {
            if (msg.data.isTraitor) {
              if (room.fuseBoxes[msg.data.id].broken) return

              if (!room.fuseBoxes[msg.data.id].redCut && msg.data.redCut) {
                room.fuseBoxes[msg.data.id].redCut = true
              }
              if (!room.fuseBoxes[msg.data.id].blueCut && msg.data.blueCut) {
                room.fuseBoxes[msg.data.id].blueCut = true
              }
              if (!room.fuseBoxes[msg.data.id].greenCut && msg.data.greenCut) {
                room.fuseBoxes[msg.data.id].greenCut = true
              }
              sendAll(
                JSON.stringify({
                  type: 'FuseBox-singleChange',
                  data: msg.data,
                }),
                ws.room
              )

              if (
                room.fuseBoxes[msg.data.id].redCut &&
                room.fuseBoxes[msg.data.id].blueCut &&
                room.fuseBoxes[msg.data.id].greenCut
              ) {
                room.timeLeft -= sabotagePenalty
                room.fuseBoxes[msg.data.id].broken = true
                sendAll(
                  JSON.stringify({
                    type: 'FuseBox-fullStateRes',
                    data: {
                      id: msg.data.id,
                      doorOpen: room.fuseBoxes[msg.data.id].doorOpen,
                      redCut: true,
                      greenCut: true,
                      blueCut: true,
                      timeLeft: room.timeLeft,
                    },
                  }),
                  ws.room
                )
              }
            } else {
              ws.send(
                JSON.stringify({
                  type: MessageType.MESSAGE,
                  data: {
                    text:
                      'Only a traitor would sabotage their own ship like that.',
                  },
                })
              )
            }
          }
        }
        break
      case MessageType.STARTVOTE:
        votingTimeout = setTimeout(() => {
          endVotes(ws.room)
        }, VOTING_TIME * 1000)
        let playersAlive = 0
        for (let player of room.players) {
          if (player.alive) playersAlive++
        }

        if (room.gameActive) {
          if (playersAlive <= 2) {
            sendAllAlive(
              JSON.stringify({
                type: MessageType.MESSAGE,
                data: {
                  text: 'Too few players left to vote',
                },
              }),
              ws.room
            )
            break
          }

          for (let player of room.players) {
            player.votes = []
          }
          room.gamePaused = true
          sendAllAlive(
            JSON.stringify({
              type: MessageType.STARTVOTE,
              data: {
                players: room.players,
                timeLeft: VOTING_TIME,
              },
            }),
            ws.room
          )
        } else {
          console.log('no change bc room inactive or less than 3 players')
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
                votes: room.players[msg.data.voted].votes.length,
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
            clearTimeout(votingTimeout)
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
      removeFromTeams(id, room)
      if (room.players.length < 1) {
        resetGame(ws.room)
      }
      delete CLIENTS[id]
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

  setTimeout(async function () {
    await pickTraitor(room)
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

    sendAllPlayers(
      JSON.stringify({
        type: 'FuseBox-fullStateRes',
        data: {
          id: 1000,
          doorOpen: false,
          redCut: false,
          greenCut: false,
          blueCut: false,
          timeLeft: false,
        },
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

  let traitorAlive = true
  for (let player of rooms[room].players) {
    if (player.isTraitor) {
      traitorAlive = player.alive
    }
  }

  let traitorWon =
    rooms[room].fixCount < FIXES_TO_WIN && traitorAlive ? true : false

  console.log(
    'FINISHED GAME in room ',
    room,
    ' time remaining: ',
    rooms[room].timeLeft,
    ' fix count: ',
    rooms[room].fixCount,
    ' traitor won: ',
    traitorWon
  )

  sendAll(
    JSON.stringify({
      type: MessageType.END,
      data: {
        traitorWon: traitorWon,
        fixCount: rooms[room].fixCount,
        timeLeft: rooms[room].timeLeft,
      },
    }),
    room
  )

  resetGame(room)
}

export async function resetGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].players = []
  rooms[room].traitors = []
  rooms[room].fixCount = 0
  rooms[room].toFix = new Array(14)
  for (let i = 0; i < rooms[room].toFix.length; i++) {
    rooms[room].toFix[i] = { id: i, broken: startBrokenArray[i] }
  }
  for (let i = 0; i < rooms[room].fuseBoxes.length; i++) {
    rooms[room].fuseBoxes[i] = {
      id: i,
      doorOpen: false,
      redCut: false,
      greenCut: false,
      blueCut: false,
      broken: false,
    }
  }
}

export function randomBreakEquipt(room: string) {
  let attempts = 0
  let brokeSomething = false
  while (!brokeSomething) {
    let randomI = Math.floor(Math.random() * rooms[room].toFix.length)

    if (!rooms[room].toFix[randomI].broken) {
      rooms[room].toFix[randomI].broken = true
      sendAll(
        JSON.stringify({
          type: 'Ship-singleChange',
          data: {
            id: randomI,
            broken: true,
            timeLeft: rooms[room].timeLeft,
            fixCount: rooms[room].fixCount,
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

  let mostVotesAgainst = 0
  let playerWithMostVotes = null
  let playersLeft = 0
  for (let i = 0; i < room.players.length; i++) {
    if (room.players[i].alive) playersLeft++
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
  if (mostVotesAgainst > 1 && playerWithMostVotes != null) {
    room.players[playerWithMostVotes].alive = false
    playerToKick = room.players[playerWithMostVotes].name
    isTraitor = room.players[playerWithMostVotes].isTraitor
    playersLeft--
    console.log('We have a victim! ', playerToKick)
  }

  sendAllPlayers(
    JSON.stringify({
      type: MessageType.ENDVOTE,
      data: {
        kickedPlayer: playerToKick,
        isTraitor: isTraitor,
        playersLeft: playersLeft,
      },
    }),
    roomName
  )

  console.log(playerToKick + ' was kicked out, ')

  setTimeout(() => {
    if (isTraitor || playersLeft < 2) {
      endGame(roomName)
    } else {
      room.gamePaused = false
    }
  }, 3000)
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
  rooms[room].players.forEach(function each(player) {
    if (!player.isTraitor) {
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
  let traitorInex = rooms[room].traitors[0]
  let traitorId = rooms[room].players[traitorInex].id
  const cWs = CLIENTS[traitorId] as customWs

  try {
    if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
      cWs.send(message)
    }
  } catch {
    console.log("couldn't send to a user")
  }
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
