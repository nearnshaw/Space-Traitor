import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import {  robotUI, satelliteUI } from './HUD'
import { playerIsTraitor } from './entities/SpaceShip'
import { EvilRobotTips, MissionControlTips } from './dialogs'
import { Room } from 'colyseus.js'
import { userData } from './connection'

let votingUI: ui.CustomPrompt
export let playerVoted: boolean = false
let votingTimeLeft: number
let voteSeconds: ui.CustomPromptText
let voteMinutes: ui.CustomPromptText
let voteText: ui.CustomPromptText

export function openVotingUI(room: Room) {
  // if(votingUI){
  //   votingUI.show()
  //   return
  // }
  playerVoted = false
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

  let offset = 30
  let i = 0
  room.state.players.forEach(player => {

    if(player.ready && player.alive){
      let PlayerName = player.name
      votingUI.addButton(
        PlayerName,
        0,
        offset,
        () => {
          log('Voted for ', PlayerName, i)
          vote(PlayerName, room)
        },
        ui.ButtonStyles.SQUARESILVER
      )
      i ++
    }
   
    votingUI.addIcon(
      // 'https://peer.decentraland.org/content/contents/' + player.thumb,
      player.thumb,
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
  
    
  });
}

export function updateVotingUI(
  voted: number,
  voter: number,
  votes: number,
  thumb: string | null
) {
  // add player icon

  votingUI.addIcon(
    // 'https://peer.decentraland.org/content/contents/' + thumb,
    thumb,
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
  voteSeconds.text.value = (timeLeft % 60).toString()
  voteText.text.value = 'Voting time left          :'
  voteMinutes.text.value = Math.floor(timeLeft / 60).toString()
}

export function closeVotingUI(playerToKick: string|null, isTraitor: boolean) {
  votingUI.hide()
 
  //votingTimer.running = false

  if (!playerToKick) {
    ui.displayAnnouncement('No one was kicked', 15)
  } else {
    ui.displayAnnouncement(playerToKick + 'was ejected out into space', 15)

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

export function vote(votedPlayer: string, room: Room) {
  if (playerVoted) {
    return
  }

  playerVoted = true


  room.send("vote", {
      voter: userData.displayName,
      voted: votedPlayer,
      })

  votingUI.addText('Waiting for others to vote', 0, -140, Color4.Red(), 20)
}
