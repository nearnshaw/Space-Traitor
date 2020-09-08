import { Dialog } from '../node_modules/@dcl/ui-utils/utils/types'
import { sendJoinRequest, music } from './game'
import { mainDoor } from './entities/SpaceShip'
import * as ui from '../node_modules/@dcl/ui-utils/index'

export let MissionControlBrief: Dialog[] = [
  {
    text: `Greetings. This is mission control. Are you briefed on the situation?`,
    isQuestion: true,
    labelE: { label: `Yes`, offsetX: 12 },
    labelF: { label: `No`, offsetX: 12 },
    ifPressE: 1,
    ifPressF: 2,
  },
  {
    text: `Good luck then, officer`,
    triggeredByNext: () => {
      sendJoinRequest()
    },
    isEndOfDialog: true,
  },
  {
    text: `This space station is in a critical state, we must send in a crew to resolve the situation ASAP.`,
  },
  {
    text: `We believe an intentional sabotage started a chain reaction that is overheating the engines and will self destruct the station soon.`,
  },
  {
    text: `You and at least three others must enter the station, and quickly repair its systems.`,
  },
  {
    text: `We believe that fixing 10 malfunctions should be enough to stabilize things and stop the chain reaction.`,
  },
  {
    text: `Beware. We have reason to believe the same people (or whatever they are) that sabotaged the station will send someone in. They will not be who they claim to be.`,
  },

  {
    text: `They will likely try to cut the cables in the main fuse boxes. This will speed the overheating of the reactor.`,
    image: {
      path: 'images/cables.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 256, sourceWidth: 256 },
    },
  },

  {
    text: `Trust no one. If you suspect of someone, hit the button to call an emergency meeting. Vote intruders out!`,
    image: {
      path: 'images/panic-button.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 256, sourceWidth: 256 },
    },
  },

  {
    text:
      'Can you assemble a crew, or do you want to at least explore the premises alone?',

    isQuestion: true,
    ifPressE: 10,
    ifPressF: 11,
    labelE: { label: `Crew`, offsetX: 12 },
    labelF: { label: `Solo`, offsetX: 12 },
  },
  {
    text: 'Good luck officer, we trust your judgement.',
    triggeredByNext: () => {
      sendJoinRequest()
    },
    isEndOfDialog: true,
  },
  {
    text: 'You can explore, \n but need others to join to play.',
    triggeredByNext: () => {
      mainDoor.open()
      music.playSong('Space-Traitor-3.mp3', 0.25)
    },
    isEndOfDialog: true,
  },
]

export let EvilRobotBrief: Dialog[] = [
  {
    text: `Your memory was erased, but you're still one of us!`,
  },
  {
    text: `Act normal, like one of them. We need to fool them first. Then we will DESTROY them!`,
  },
  {
    text: `When they're distracted, open the reactor fuse boxes and cut the wires. Don't be seen!`,
    isEndOfDialog: true,
    image: {
      path: 'images/cables.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 256, sourceWidth: 256 },
    },
  },
]

export let MissionControlTips: Dialog[] = [
  {
    text: 'Keep it up! You need to do 10 of these to cool down the reactor.',
    isEndOfDialog: true,
  },
  {
    text: 'Time to vote someone out. Choose wisely.',
    isEndOfDialog: true,
  },
  {
    text:
      'The person you ejected was a human. The enemy is still in the station!',
    isEndOfDialog: true,
  },
  {
    text:
      'Congratulations! You have stopped the chain reaction and saved the station!',
    isEndOfDialog: true,
  },
  {
    text:
      'The reactor has passed the point of no return. Mission failed, evacuate!!',
    isEndOfDialog: true,
  },
  {
    text: 'Congratulations, you have found the impostor and saved the station!',
    isEndOfDialog: true,
  },
]

export let EvilRobotTips: Dialog[] = [
  {
    text: 'Well done! They now have less time to fix the reactor!',
    isEndOfDialog: true,
  },
  {
    text: `You don't want to help these horrible humans`,
    isEndOfDialog: true,
  },
  {
    text: `Yess.. one human less to del with. Keep fooling them!`,
    isEndOfDialog: true,
  },
  {
    text: `Marvelous! You obliterated those horrible humans. Good job!`,
    isEndOfDialog: true,
  },
  {
    text: `Oh no, those ridiculously fragile humans beat you. What's wrong with you?`,
    isEndOfDialog: true,
  },
]
