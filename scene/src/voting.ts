import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import { userName } from './getUser'
import {  robotUI, satelliteUI } from './HUD'
import { playerIsTraitor } from './entities/SpaceShip'
import { EvilRobotTips, MissionControlTips } from './dialogs'
import { Room } from 'colyseus.js'

let votingUI: ui.CustomPrompt
export let playerVoted: boolean = false
let votingTimeLeft: number
let voteSeconds: ui.CustomPromptText
let voteMinutes: ui.CustomPromptText
let voteText: ui.CustomPromptText

export function openVotingUI(room: Room) {
  playerVoted = false
  // timer.running = false
  votingTimeLeft = room.state.votingCountdown
  votingUI = new ui.CustomPrompt(ui.PromptStyles.DARKSLANTED, 512 * 1.5, 512)
  votingUI.addText('Time to Vote', 0, 130, Color4.Red(), 30)
  votingUI.addText("Who's the traitor?", 0, 100)

  voteSeconds = votingUI.addText((votingTimeLeft % 60).toString(), 220, -200)
  voteText = votingUI.addText('Voting time left          :', 130, -200)
  voteMinutes = votingUI.addText(
    Math.floor(votingTimeLeft / 60).toString(),
    180,
    -200
  )

  //   engine.addSystem(votingTimer)
  //   votingTimer.running = true

  let offset = 30
  for (let i = 0; i < room.state.players.length; i++) {
    let player = room.state.players[i]
    if(player.ready && player.alive){
      votingUI.addButton(
        player.name,
        0,
        offset,
        () => {
          log('Voted for ', player.name, i)
          vote(i, room)
        },
        ui.ButtonStyles.SQUARESILVER
      )
    }
   
    votingUI.addIcon(
      'https://peer.decentraland.org/content/contents/' + room.state.players[i].thumb,
      -100,
      offset,
      64 * 0.7,
      64 * 0.7,
      {
        sourceHeight: 128,
        sourceWidth: 128,
      }
    )
    // Player icon
    offset -= 50
  }
}

export function updateVotingUI(
  voted: number,
  voter: number,
  votes: number,
  thumb: string | null
) {
  // add player icon

  votingUI.addIcon(
    'https://peer.decentraland.org/content/contents/' + thumb,
    70 + votes * 40,
    30 + voted * -50,
    64 * 0.5,
    64 * 0.5,
    {
      sourceHeight: 128,
      sourceWidth: 128,
    }
  )
}

export function updateVotingTimer(timeLeft: number){
  voteSeconds = votingUI.addText((timeLeft % 60).toString(), 220, -200)
  voteText = votingUI.addText('Voting time left          :', 130, -200)
  voteMinutes = votingUI.addText(
    Math.floor(timeLeft / 60).toString(),
    180,
    -200
  )
}

export function closeVotingUI(playerToKick: string|null, isTraitor: boolean) {
  votingUI.hide()
  //votingTimer.running = false

  if (!playerToKick) {
    ui.displayAnnouncement('No one was kicked')
  } else {
    ui.displayAnnouncement(playerToKick + 'was ejected out into space')

    utils.setTimeout(3000, () => {
      // timer.running = true
      if (isTraitor) {
        satelliteUI.openDialogWindow(MissionControlTips, 5)
        //ui.displayAnnouncement(playerToKick + ' was the traitor, you win!')
      } else {
        if (playerIsTraitor) {
          robotUI.openDialogWindow(EvilRobotTips, 2)
        } else {
        }
      }
    })
  }
}

export function vote(votedPlayer: number, room: Room) {
  if (playerVoted) {
    return
  }

  playerVoted = true


  room.send("vote", {
          voted: votedPlayer,
          voter: userName,
        })
  // socket.send(
  //   JSON.stringify({
  //     type: MessageType.VOTE,
  //     data: {
  //       voted: votedPlayer,
  //       voter: userName,
  //     },
  //   })
  // )

  votingUI.addText('Waiting for others to vote', 0, -140, Color4.Red(), 20)
}

// class VOTINGCountdownSystem implements ISystem {
//   running: boolean = true
//   timer: number = 1
//   update(dt: number) {
//     if (this.running == false) return
//     this.timer -= dt
//     if (this.timer <= 0) {
//       this.timer = 1
//       votingTimeLeft -= 1
//       voteSeconds.text.value = (votingTimeLeft % 60).toString()
//       voteMinutes.text.value = Math.floor(votingTimeLeft / 60).toString()

//       if (votingTimeLeft < 0) {
//         this.running = false
//         // end voting
//       }
//     }
//   }
// }

// let votingTimer = new VOTINGCountdownSystem()
