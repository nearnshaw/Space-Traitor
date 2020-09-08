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
import { timer, startUI, satelliteUI, robotUI } from './HUD'
import { Button } from './entities/Button'
import { FuseBox } from './entities/fuseBox'
import {
  MissionControlBrief,
  EvilRobotTips,
  MissionControlTips,
} from './dialogs'
import { MusicPlayer } from './musicPlayer'

let doorBell = new Button(
  {
    position: new Vector3(2.5, 1, 5.7),
    rotation: Quaternion.Euler(0, 270 + 45, 90),
  },
  new GLTFShape('models/Green_SciFi_Button.glb'),
  async () => {
    satelliteUI.openDialogWindow(MissionControlBrief, 0)
  },
  'Join Game'
)

export async function sendJoinRequest() {
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
}

engine.addEntity(doorBell)

export let ship: SpaceShip
export let fuse1: FuseBox
export let fuse2: FuseBox
export let fuse3: FuseBox
export let fuse4: FuseBox

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
      openVotingUI(data.players, data.timeLeft)
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
      music.playSong('tyops_game-movie-suspense-theme.mp3')

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
  fuse1 = new FuseBox(0, {
    position: new Vector3(38.5, 1.5, 8.65),
    rotation: Quaternion.Euler(0, 0, 0),
  })
  fuse2 = new FuseBox(1, {
    position: new Vector3(22, 1, 47.25),
    rotation: Quaternion.Euler(0, 180, 0),
  })
  fuse3 = new FuseBox(2, {
    position: new Vector3(22, 5.5, 39),
    rotation: Quaternion.Euler(0, 180, 0),
  })
  fuse4 = new FuseBox(3, {
    position: new Vector3(19, 1, 8.5),
    rotation: Quaternion.Euler(0, 0, 0),
  })

  await startSocketListeners()
}

export function finishGame(traitorWon: boolean) {
  ship.active = false
  movePlayerTo({ x: 1, y: 1, z: 1 })
  if (traitorWon && playerIsTraitor) {
    robotUI.openDialogWindow(EvilRobotTips, 3)
    // ui.displayAnnouncement(
    //   'Congratulations! You obliterated those horrible humans!'
    // )
  } else if (traitorWon && !playerIsTraitor) {
    satelliteUI.openDialogWindow(MissionControlTips, 4)
    //ui.displayAnnouncement('Oh no, the android has defeated you.')
  } else if (!traitorWon && playerIsTraitor) {
    robotUI.openDialogWindow(EvilRobotTips, 4)
    // ui.displayAnnouncement(
    //   "Oh no, those ridiculously fragile humans beat you. What's wrong with you?"
    // )
  } else if (!traitorWon && !playerIsTraitor) {
    // ui.displayAnnouncement(
    //   'Congratulations! You have saved the humanity from the evil android!'
    // )
    satelliteUI.openDialogWindow(MissionControlTips, 3)
  }
}

Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
  log(
    `pos:  new Vector3(`,
    Camera.instance.position.x,
    `,`,
    Camera.instance.position.y,
    `,`,
    Camera.instance.position.z,
    `)`
  )
  log(
    `rot: Quaternion.Euler(`,
    Camera.instance.rotation.eulerAngles.x,
    `,`,
    Camera.instance.rotation.eulerAngles.y,
    `,`,
    Camera.instance.rotation.eulerAngles.z,
    `)`
  )
})

// Setup Environemnt
const environmentEntity = new Entity()
environmentEntity.addComponent(
  new Transform({
    position: Vector3.Zero(),
  })
)
environmentEntity.addComponent(new GLTFShape('models/Environment.glb'))
engine.addEntity(environmentEntity)

export let music = new MusicPlayer()
music.playSong('tyops_game-movie-suspense-theme.mp3')
