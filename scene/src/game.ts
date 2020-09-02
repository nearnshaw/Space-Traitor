import {
  joinSocketsServer,
  MessageAction,
  messageActions,
  startSocketListeners,
  socket,
} from './entities/MultiplayerEntity'
import { MessageType } from './messaging'
import * as ui from '../node_modules/@dcl/ui-utils/index'
import { SpaceShip } from './entities/SpaceShip'

let doorBell = new Entity()
doorBell.addComponent(
  new Transform({
    position: new Vector3(4, 1, 4),
  })
)
doorBell.addComponent(new BoxShape())

doorBell.addComponent(
  new OnPointerDown(async () => {
    //await joinGame()
    socket.send(
      JSON.stringify({
        type: MessageType.JOIN,
        data: {
          sender: '123',
        },
      })
    )
  })
)
engine.addEntity(doorBell)

let ship: SpaceShip

joinGame()

export async function joinGame() {
  await joinSocketsServer()

  let newGame: MessageAction = {
    tag: MessageType.NEWGAME,
    action: (data) => {
      //game.startGame(data.duration)
    },
  }
  let endGame: MessageAction = {
    tag: MessageType.END,
    action: (data) => {
      //game.endGame(data.blue, data.red)
    },
  }
  let message: MessageAction = {
    tag: MessageType.MESSAGE,
    action: (data) => {
      ui.displayAnnouncement(data.text, 10, false, Color4.Yellow())
    },
  }

  messageActions.push(newGame)
  messageActions.push(endGame)
  messageActions.push(message)

  //ship = new SpaceShip()
  // initate any other multiplayer things
  await startSocketListeners()
  socket.onopen = function (event) {
    //ship.start()
  }
}
