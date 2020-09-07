import * as ui from '../node_modules/@dcl/ui-utils/index'
import {
  PromptStyles,
  ButtonStyles,
} from '../node_modules/@dcl/ui-utils/utils/types'
import { Player, MessageType } from './types'
import { socket } from './entities/MultiplayerEntity'
import { setTimeout } from './Utils'
import { userName } from './getUser'
import { timer, robotUI, satelliteUI } from './HUD'
import { playerIsTraitor } from './entities/SpaceShip'
import { EvilRobotTips, MissionControlTips } from './dialogs'
import { CustomPromptText } from '../node_modules/@dcl/ui-utils/prompts/customPrompt/index'

let votingUI: ui.CustomPrompt
export let playerVoted: boolean = false
let votingTimeLeft: number
let voteSeconds: CustomPromptText
let voteMinutes: CustomPromptText
let voteText: CustomPromptText

export function openVotingUI(players: Player[], timeLeft: number) {
  playerVoted = false
  timer.running = false
  votingTimeLeft = timeLeft
  votingUI = new ui.CustomPrompt(PromptStyles.DARKSLANTED, 512 * 1.5, 512)
  votingUI.addText('Voting Time', 0, 130, Color4.Red(), 30)
  votingUI.addText("Who's the traitor?", 0, 100)

  voteSeconds = votingUI.addText((timeLeft % 60).toString(), 220, -200)
  voteText = votingUI.addText('Voting time left          :', 130, -200)
  voteMinutes = votingUI.addText(
    Math.floor(timeLeft / 60).toString(),
    180,
    -200
  )

  votingTimer.running = true

  let offset = 30
  for (let i = 0; i < players.length; i++) {
    votingUI.addButton(
      players[i].name,
      0,
      offset,
      () => {
        log('Voted for ', players[i].name, i)
        vote(i)
      },
      ButtonStyles.SQUARESILVER
    )

    votingUI.addIcon(
      'https://peer.decentraland.org/content/contents/' + players[i].thumb,
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

export function closeVotingUI(playerToKick: string, isTraitor: boolean) {
  votingUI.close()
  votingTimer.running = false

  if (!playerToKick) {
    ui.displayAnnouncement('No one was kicked')
  } else {
    ui.displayAnnouncement(playerToKick + 'was ejected out into space')

    setTimeout(3000, () => {
      timer.running = true
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

export function vote(votedPlayer: number) {
  if (playerVoted) {
    return
  }

  playerVoted = true

  socket.send(
    JSON.stringify({
      type: MessageType.VOTE,
      data: {
        voted: votedPlayer,
        voter: userName,
      },
    })
  )

  votingUI.addText('Waiting for others to vote', 0, -140, Color4.Red(), 20)
}

class VOTINGCountdownSystem implements ISystem {
  running: boolean = true
  timer: number = 1
  update(dt: number) {
    if (this.running == false) return
    this.timer -= dt
    if (this.timer <= 0) {
      this.timer = 1
      votingTimeLeft -= 1
      voteSeconds.text.value = (votingTimeLeft % 60).toString()
      voteMinutes.text.value = Math.floor(votingTimeLeft / 60).toString()

      if (votingTimeLeft < 0) {
        this.running = false
        // end voting
      }
    }
  }
}

let votingTimer = new VOTINGCountdownSystem()
engine.addSystem(votingTimer)
