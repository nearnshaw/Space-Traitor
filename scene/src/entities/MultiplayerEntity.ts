import { setTimeout } from '../Utils'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

//export let sceneMessageBus = new MessageBus()

export let socket: WebSocket

export type MessageAction = { tag: string; action: (data) => void }

export let messageActions: MessageAction[] = []

export async function joinSocketsServer() {
  // Fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log('You are in the realm: ', realm.displayName)
  // Connect to ws server
  socket = await new WebSocket(server + '/' + realm.displayName)
  return
}

export async function startSocketListeners() {
  // Listen for incoming ws messages
  log('full list of messages lisened for: ', messageActions)
  socket.onmessage = function (event) {
    try {
      const msg = JSON.parse(event.data)
      //log(msg)

      for (let action of messageActions) {
        if (msg.type == action.tag) {
          log('WSMESSAGE ', msg.type, ' : ', msg.data)
          action.action(msg.data)
        }
      }
    } catch (error) {
      log(error)
    }
  }
  return
}

export abstract class MultiplayerEntity<
  SingleChange,
  FullState
> extends Entity {
  private initialized: boolean = false
  public socket: WebSocket

  constructor(private readonly entityType: string) {
    super()

    this.socket = socket

    let change: MessageAction = {
      tag: this.generateMessageId(SINGLE_CHANGE_EVENT),
      action: (data) => {
        this.reactToSingleChanges(data)
      },
    }

    messageActions.push(change)

    let getStateResponse: MessageAction = {
      tag: this.generateMessageId(FULL_STATE_RESPONSE),
      action: (data) => {
        //if (!this.initialized) {
        this.initialized = true
        this.loadFullState(data)
        //}
      },
    }

    messageActions.push(getStateResponse)
  }

  /** Request the full state from server, and load it */
  public start() {
    // Load the full state

    // Request full state
    this.requestFullState()

    //this.initialized = true
  }

  public propagateChange(change: SingleChange) {
    if (socket.readyState === 0) return

    // Letting every else know
    socket.send(
      JSON.stringify({
        type: this.generateMessageId(SINGLE_CHANGE_EVENT),
        data: change,
      })
    )
  }

  private generateMessageId(messageName: string) {
    return `${this.entityType}-${messageName}`
  }

  private requestFullState() {
    if (!this.initialized) {
      socket.send(
        JSON.stringify({
          type: this.generateMessageId(FULL_STATE_REQUEST),
          data: null,
        })
      )
    }
  }

  protected abstract reactToSingleChanges(change: SingleChange): void
  protected abstract loadFullState(fullState: FullState): void
}

const FULL_STATE_REQUEST = 'fullStateReq'
const FULL_STATE_RESPONSE = 'fullStateRes'
const SINGLE_CHANGE_EVENT = 'singleChange'
