import * as ui from '../node_modules/@dcl/ui-utils/index'
import {
  PromptStyles,
  ButtonStyles,
} from '../node_modules/@dcl/ui-utils/utils/types'
import { Player, MessageType } from './types'
import { socket } from './entities/MultiplayerEntity'
import { userName } from './game'
import { setTimeout } from './Utils'
import { playerVoted } from './entities/SpaceShip'

let votingUI: ui.CustomPrompt

export function openVotingUI(players: Player[]) {
  playerVoted = false
  votingUI = new ui.CustomPrompt(PromptStyles.DARKSLANTED)
  votingUI.addText('Voting Time', 0, 130, Color4.Red(), 30)
  votingUI.addText("Who's the traitor?", 0, 100)

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

  if (!playerToKick) {
    ui.displayAnnouncement('No one was kicked')
  } else {
    ui.displayAnnouncement(playerToKick + 'was ejected out into space')

    setTimeout(3000, () => {
      if (isTraitor) {
        ui.displayAnnouncement(playerToKick + ' was the traitor, you win!')
      } else {
        ui.displayAnnouncement(
          playerToKick + ' was NOT an android, it still is among you'
        )
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
}
