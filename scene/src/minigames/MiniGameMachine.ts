import { WordTyper } from "./WordTyper"
import { BugClicker } from "./BugClicker"
import * as ui from '../../node_modules/@dcl/ui-utils/index'
import { PromptStyles } from "../../node_modules/@dcl/ui-utils/utils/types"
import { SwitchToggler } from "./SwitchToggler"

export class MiniGame {
  started: boolean
  successesNeeded = 3
  currentSuccesses = 0
  promptWidth = 800
  promptHeight = 600
  prompt = new  ui.CustomPrompt(PromptStyles.DARK, this.promptWidth, this.promptHeight)
  headerText = this.prompt.addText('', 0, 260, Color4.Green(), 30)
  successesText = this.prompt.addText('SUCCESS: 0/' + this.successesNeeded, 0, -250, Color4.Yellow(), 30)

  Reset() {
    this.currentSuccesses = 0
    this.UpdateSuccessText()
    this.started = false
  }

  Start() {
    this.started = true
    this.prompt.reopen()
  }

  Stop()
  {
    this.prompt.close()
    this.Reset()
  }

  Update(dt: number) {
    
  }

  UpdateSuccessText() {
    this.successesText.text.value = 'SUCCESS: ' + this.currentSuccesses + "/" + this.successesNeeded
  }

  AddSuccess(newSuccesses: number) {
    if(newSuccesses <= 0) return

    this.currentSuccesses += newSuccesses

    this.UpdateSuccessText()
      
    if(this.currentSuccesses == this.successesNeeded) {
      this.Win()
      return
    }
  }

  Win() {
    this.Stop()
  }
}

@Component('miniGameMachine')
export class MiniGameMachine {
  minigame: MiniGame
  
  constructor(entity: Entity) {
    // Randomize instantiated MiniGame type
    const randomNumber = Math.floor(Scalar.RandomRange(0,3))

    switch (randomNumber) {
      case 1:
        this.minigame = new BugClicker()
        break;
      case 2:
          this.minigame = new SwitchToggler()
        break;
      default: // 0
          this.minigame = new WordTyper()
        break;
    }

    entity.addComponent(
      new OnPointerDown(async () => {
        this.minigame.Start()
      }))
  }

  Update(dt: number) {
    this.minigame.Update(dt)
  }
}

class MiniGameMachinesSystem implements ISystem {
  miniGames: ComponentGroup = engine.getComponentGroup(MiniGameMachine)

  update(dt: number) {
    for (let miniGameEntity of this.miniGames.entities) {
      let miniGameMachine = miniGameEntity.getComponent(MiniGameMachine)
      miniGameMachine.Update(dt)
    }
  }
}
let miniGamesSystem = new MiniGameMachinesSystem()
engine.addSystem(miniGamesSystem)