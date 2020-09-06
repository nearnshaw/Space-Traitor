import { Dialog } from '../node_modules/@dcl/ui-utils/utils/types'
import { sendJoinRequest } from './game'

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
    text: `Good lick then, officer`,
    triggeredByNext: () => {
      sendJoinRequest()
    },
    isEndOfDialog: true,
  },
  {
    text: `This space ship is in a critical state, we need to send in a crew to resolve the situation ASAP.`,
  },
  {
    text: `We believe an intentional sabotage has started a chain reaction that will overheat the engines and self destruct the ship soon.`,
  },
  {
    text: `You, as part of a team of at least four others must enter the ship, and quickly repair the systems of the ship.`,
  },
  {
    text: `We believe that with fixing 10 malfunctions it will be enough to stabalize the system and stop the chain reaction.`,
  },
  {
    text: `Beware. We have reason to believe that the same group that sabotaged the ship will send someone in. They will not be who they claim to be.`,
  },

  {
    text: `They will likely want to cut the cables in the main reactor fuse boxes. This will shorten the estimated time you have left.`,
    image: {
      path: 'images/cables.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 512, sourceWidth: 512 },
    },
  },

  {
    text: `Trust no one. If you suspect of someone, hit the button to call an emergency meeting and vote them out!`,
    image: {
      path: 'images/panic-button.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 512, sourceWidth: 512 },
    },
  },
  {
    text: 'Good luck officer, we trust your judgement.',
    isEndOfDialog: true,
    triggeredByNext: () => {
      sendJoinRequest()
    },
  },
]

export let EvilRobotBrief: Dialog[] = [
  {
    text: `Your memory was erased, but you're still one of us!`,
  },
  {
    text: `Act normal, like one of them. We need to fool them first. Then we can DESTROY them!`,
  },
  {
    text: `When they're distracted, open the reactor fuse boxes and cut the wires. Don't be seen!`,
    isEndOfDialog: true,
    image: {
      path: 'images/cables.png',
      height: 128,
      width: 128,
      offsetX: -20,
      section: { sourceHeight: 512, sourceWidth: 512 },
    },
  },
]

export let MissionControlTips: Dialog[] = [
  {
    text: 'Keep making these fixes. You need to do 10 to cool down the ship.',
    isEndOfDialog: true,
  },
  {
    text: 'Time to vote someone out. Choose wisely.',
    isEndOfDialog: true,
  },
  {
    text: 'The person you ejected was a human. The enemy is still in the ship!',
    isEndOfDialog: true,
  },
  {
    text:
      'Congratulations! You have stopped the chain reaction and saved the ship!',
    isEndOfDialog: true,
  },
  {
    text:
      'The ship has passed the point of no return. Mission failed, evacuate!!',
    isEndOfDialog: true,
  },
  {
    text: 'Congratulations, you have found the impostor and saved the ship!',
    isEndOfDialog: true,
  },
]

export let EvilRobotTips: Dialog[] = [
  {
    text: 'Well done! They now have less time to fix the ship!',
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
    text: `Marvelous! You obliterated those horrible humans!`,
    isEndOfDialog: true,
  },
  {
    text: `Oh no, those ridiculously fragile humans beat you. What's wrong with you?`,
    isEndOfDialog: true,
  },
]
