import {
  joinSocketsServer,
  MessageAction,
  messageActions,
  startSocketListeners,
  socket,
} from './entities/MultiplayerEntity'
import { MessageType } from './types'
import * as ui from '../node_modules/@dcl/ui-utils/index'
import { SpaceShip, playerIsAlive, playerIsTraitor } from './entities/SpaceShip'
import { openVotingUI, updateVotingUI, closeVotingUI } from './voting'
import { getUserInfo, userName } from './getUser'
import { MiniGameMachine } from './minigames/MiniGameMachine'
import { timer } from './HUD'
import { Button } from './entities/Button'
import { FuseBox } from './entities/fuseBox'

let doorBell = new Button(
  {
    position: new Vector3(4, 1, 4),
  },
  new GLTFShape('models/Green_SciFi_Button.glb'),
  async () => {
    let userInfo = await getUserInfo()
    log(userInfo)

    socket.send(
      JSON.stringify({
        type: MessageType.JOIN,
        data: {
          sender: userName,
          thumb: userInfo.id
            ? userInfo.metadata.avatars[0].avatar.snapshots.face128
            : 'Qmbqv4pZvhypGj3KiCisvxn9UazodQ8aQStiBEy6HvxuJz',
        },
      })
    )
  },
  'Join Game'
)

engine.addEntity(doorBell)

export let ship: SpaceShip

joinGame()

export async function joinGame() {
  await joinSocketsServer()

  let endGame: MessageAction = {
    tag: MessageType.END,
    action: (data) => {
      timer.running = false
      finishGame(data.traitorWon)
      //game.endGame(data.blue, data.red)
    },
  }
  let message: MessageAction = {
    tag: MessageType.MESSAGE,
    action: (data) => {
      ui.displayAnnouncement(data.text, 10, false, Color4.Yellow())
    },
  }
  let startVote: MessageAction = {
    tag: MessageType.STARTVOTE,
    action: (data) => {
      if (!playerIsAlive) return
      openVotingUI(data.players)
      ship.active = false
    },
  }

  let vote: MessageAction = {
    tag: MessageType.VOTE,
    action: (data) => {
      if (!playerIsAlive) return
      updateVotingUI(data.voted, data.voter, data.votes, data.thumb)
    },
  }
  let endVote: MessageAction = {
    tag: MessageType.ENDVOTE,
    action: (data) => {
      if (!playerIsAlive) return
      closeVotingUI(
        data.kickedPlayer ? data.kickedPlayer : null,
        data.isTraitor
      )
      if (data.kickedPlayer == userName) {
        movePlayerTo({ x: 1, y: 1, z: 1 })
      }
      ship.active = true
      if (data.isTraitor) {
        finishGame(true)
      }
    },
  }

  messageActions.push(endGame)
  messageActions.push(message)
  messageActions.push(startVote)
  messageActions.push(vote)
  messageActions.push(endVote)

  ship = new SpaceShip()
  let fuse1 = new FuseBox(0, { position: new Vector3(15, 1, 15) })
  let fuse2 = new FuseBox(1, { position: new Vector3(17, 1, 15) })
  let fuse3 = new FuseBox(2, { position: new Vector3(19, 1, 15) })

  // initate any other multiplayer things

  //   ship.start()
  //   fuse1.start()
  // fuse2.start()
  // fuse3.start()

  await startSocketListeners()
}

export function finishGame(traitorWon: boolean) {
  ship.active = false
  movePlayerTo({ x: 1, y: 1, z: 1 })
  if (traitorWon && playerIsTraitor) {
    ui.displayAnnouncement(
      'Congratulations! You obliterated those horrible humans!'
    )
  } else if (traitorWon && !playerIsTraitor) {
    ui.displayAnnouncement('Oh no, the android has defeated you.')
  } else if (!traitorWon && playerIsTraitor) {
    ui.displayAnnouncement(
      "Oh no, those ridiculously fragile humans beat you. What's wrong with you?"
    )
  } else {
    ui.displayAnnouncement(
      'Congratulations! You have saved the humanity from the evil android!'
    )
  }
}
