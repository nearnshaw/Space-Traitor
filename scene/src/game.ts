import * as ui from '@dcl/ui-scene-utils'
import {
  SpaceShip,
  mainDoor,
  setPlayerIsTraitor,
  setPlayerIsAlive,
  playerIsTraitor,
  playerIsAlive,
} from './entities/SpaceShip'
import {
  openVotingUI,
  updateVotingUI,
  closeVotingUI,
  updateVotingTimer,
} from './voting'
import { getUserInfo } from './getUser'
import {
  startUI,
  satelliteUI,
  robotUI,
  fixCounter,
  updateCountdown,
} from './HUD'
import { Button } from './entities/Button'
import { CableColors, FuseBox, toggleBox, toggleCable } from './entities/fuseBox'
import {
  MissionControlBrief,
  EvilRobotTips,
  MissionControlTips,
  EvilRobotBrief,
} from './dialogs'
import { music } from './musicPlayer'
import { connect, setUserData, userData } from './connection'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import { Room } from 'colyseus.js'
import * as utils from '@dcl/ecs-scene-utils'

export let server: Room
let fuseBoxes: FuseBox[] = []

connect('my_room').then((room) => {
  log('Connected!')

  server = room

  ship = new SpaceShip(room)
  fuse1 = new FuseBox(
    0,
    {
      position: new Vector3(38.5, 1.5, 8.65),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    room
  )
  fuse2 = new FuseBox(
    1,
    {
      position: new Vector3(22, 1, 47.25),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    room
  )
  fuse3 = new FuseBox(
    2,
    {
      position: new Vector3(22, 5.5, 39),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    room
  )
  fuse4 = new FuseBox(
    3,
    {
      position: new Vector3(19, 1, 8.5),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    room
  )
  fuseBoxes.push(fuse1)
  fuseBoxes.push(fuse2)
  fuseBoxes.push(fuse3)
  fuseBoxes.push(fuse4)

  let sceneLoaded = true

  room.onMessage('msg', (data) => {
    ui.displayAnnouncement(data.text, 12, Color4.Yellow())
  })

  room.onMessage('new', (data) => {
    log('START game')
    newGame(room)
  })

  room.onMessage('end', (data) => {
    log('END game')
    finishGame(data.traitorWon) 
  })

  room.onMessage('reset', (data) => {
    log('RESET game')
    resetGame()
  })

  room.onMessage('startvote', (data) => {
    log('Starting Votes')
    if(!sceneLoaded) return
    // if (!playerIsAlive) return
    music.playSong('tyops_game-movie-suspense-theme.mp3', 0.5)
    ship.active = false
    openVotingUI(room)
  })

  room.onMessage('endvote', (data) => {
    log('Ending votes')
    if(!sceneLoaded) return
    // if (!playerIsAlive) return
    music.playSong('Space-Traitor-3.mp3')
    closeVotingUI(data.voted, data.wasTraitor)
    if (data.voted == userData.displayName) {
      movePlayerTo({ x: 1, y: 1, z: 1 })
      if(!playerIsTraitor){
        satelliteUI.openDialogWindow(MissionControlTips, "dead")
      }
    }
    ship.active = true
  })

  room.state.fuseBoxes.onAdd = (box) => {
    log("Added fusebox => ", box.id)
    box.listen('doorOpen', (value) => {
      log('box open ', box.id, value)
      if(!sceneLoaded) return
      toggleBox(fuseBoxes[box.id], value, true)
    })
    box.listen('redCut', (value) => {
      log('red cut ',box.id, value)
      if(!sceneLoaded) return
      toggleCable(fuseBoxes[box.id], value, CableColors.Red)
    })
    box.listen('greenCut', (value) => {
      log('green cut ',box.id, value)
      if(!sceneLoaded) return
      toggleCable(fuseBoxes[box.id], value, CableColors.Green)
    })
    box.listen('blueCut', (value) => {
      log('blue cut ',box.id, value)
      if(!sceneLoaded) return
      toggleCable(fuseBoxes[box.id], value, CableColors.Blue)
    })
    box.listen('broken', (value) => {
      log('broken ',box.id, value)
      if(!sceneLoaded) return
      if (playerIsTraitor) {
        robotUI.openDialogWindow(EvilRobotTips, 0)
      }
    })
  }

  room.state.toFix.onAdd = (eqpt) => {
    log("added eqpt ", eqpt.id)
    eqpt.listen('broken', (value) => {
      if(!sceneLoaded) return
      log('eqpt broken ', eqpt.id, value)
      ship.reactToSingleChanges({ broken: value, id: eqpt.id })
    })
  }

  room.state.players.onAdd = (player) => {
    log('Added player => ', player.name)
    player.listen('ready', (value) => {
      log('player is ready ', player.name, value)
    })
    player.listen('alive', (value) => {
      log('player died ', player.name, value)
      //if(player.name == myName){}
    })
    if(player.name == userData.displayName){

      player.listen('isTraitor',(value)=>{
        log("YOU ARE THE TRAITOR ", value)
        setPlayerIsTraitor(value)
        if(value){
          if (satelliteUI.isDialogOpen) {
            satelliteUI.closeDialogWindow()
          }
          robotUI.openDialogWindow(EvilRobotBrief, 0)
        }
      })
    }
    player.votes.onAdd = (voter)=>{
      log('player ', player.name, " has a new vote from ", voter)
      if (room.state.paused) {
        let voterThumb: string = null
        let votedPosition: number = 0
        let votedPlayerFound: boolean = false
        room.state.players.forEach(iteratedPlayer => {
          if(iteratedPlayer.name == voter) voterThumb = iteratedPlayer.thumb
          if(iteratedPlayer.name == player.name) votedPlayerFound = true 
          if(iteratedPlayer.alive && !votedPlayerFound) votedPosition++
        });
        updateVotingUI(votedPosition, 0, player.votes.length, voterThumb)
      }
    }
  }

  room.state.listen('fixCount', (value) => {
    if (room.state.active) {
      fixCounter.set(value)
    }
  })

  room.state.players.onRemove = (player) => {
    log('player left game ', player.name)
  }

  room.state.listen('countdown', (value) => {
    if (!room.state.paused) {
      updateCountdown(value)

    }
  })

  room.state.listen('votingCountdown', (value) => {
    if (room.state.paused) {
      updateVotingTimer(value)
    }
  })


  // horrible hacks
  toggleCable(fuseBoxes[0], false, CableColors.Red)
  toggleCable(fuseBoxes[0], false, CableColors.Green)
  toggleCable(fuseBoxes[0], false, CableColors.Blue)
  ship.reactToSingleChanges({ broken: false, id: 0 })


})

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
  server.send('ready', {
    sender: userData.displayName,
    thumb: userInfo? userInfo.face128
      : 'https://peer.decentraland.org/content/contents/QmcHi6q7N6Ltse4YgFv2WPTMDpKCup3SQAUgQJ2Tjxkitg',
  })
}

engine.addEntity(doorBell)

export let ship: SpaceShip
export let fuse1: FuseBox
export let fuse2: FuseBox
export let fuse3: FuseBox
export let fuse4: FuseBox


export async function newGame(room: Room) {
  resetGame()
  if(!userData){
    await setUserData()
  }
  startUI(room.state.countdown)


  setPlayerIsAlive(true)


  mainDoor.open()
  utils.setTimeout(30000, () => {
    mainDoor.close()
  })

  music.playSong('Space-Traitor-2.mp3', 0.25)

  fixCounter.set(0)

  if (playerIsTraitor) {
    log('PLAYER IS TRAITOR')
  }
}

export function resetGame() {
  fuse1.reset()
  fuse2.reset()
  fuse3.reset()
  fuse4.reset()

  ship.resetShip()
}

export function finishGame(traitorWon: boolean) {
  ship.active = false
  mainDoor.open()
  movePlayerTo({ x: 1, y: 1, z: 1 })
  if (traitorWon && playerIsTraitor) {
    robotUI.openDialogWindow(EvilRobotTips, 3)
  
  } else if (traitorWon && !playerIsTraitor) {
    satelliteUI.openDialogWindow(MissionControlTips, 4)
  
  } else if (!traitorWon && playerIsTraitor) {
    robotUI.openDialogWindow(EvilRobotTips, 4)
  
  } else if (!traitorWon && !playerIsTraitor) {
  
    satelliteUI.openDialogWindow(MissionControlTips, 3)
  }
}

// Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
//   log(
//     `pos:  new Vector3(`,
//     Camera.instance.position.x,
//     `,`,
//     Camera.instance.position.y,
//     `,`,
//     Camera.instance.position.z,
//     `)`
//   )
//   log(
//     `rot: Quaternion.Euler(`,
//     Camera.instance.rotation.eulerAngles.x,
//     `,`,
//     Camera.instance.rotation.eulerAngles.y,
//     `,`,
//     Camera.instance.rotation.eulerAngles.z,
//     `)`
//   )
// })

// Setup Environemnt
const environmentEntity = new Entity()
environmentEntity.addComponent(
  new Transform({
    position: Vector3.Zero(),
  })
)
environmentEntity.addComponent(new GLTFShape('models/Environment.glb'))
engine.addEntity(environmentEntity)
