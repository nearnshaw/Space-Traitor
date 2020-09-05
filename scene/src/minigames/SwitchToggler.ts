import { MiniGame } from "./MiniGameMachine"
import { SwitchStyles } from "../../node_modules/@dcl/ui-utils/utils/types"
import { CustomPromptSwitch } from "../../node_modules/@dcl/ui-utils/prompts/customPrompt/index"

export class SwitchToggler extends MiniGame {
    columns = Math.floor(Scalar.RandomRange(5, 7))
    rows = Math.floor(Scalar.RandomRange(4, 7))
    successesNeeded = this.columns * this.rows
    targetState = Scalar.RandomRange(0, 1) > 0.5
    headerText = this.prompt.addText('TURN EVERYTHING ' + (this.targetState? 'ON' : 'OFF'), 0, 250, Color4.Green(), 40)
    switches: CustomPromptSwitch[] = new Array()
  
    constructor() {
      super()
  
      this.SetupSwitches()
      
      this.prompt.close()
    }

    AddSuccess(newSuccesses: number) {
      if(newSuccesses == 0) return
  
      this.currentSuccesses += newSuccesses
  
      this.UpdateSuccessText()
        
      if(this.currentSuccesses == this.successesNeeded) {
        this.Win()
        return
      }
    }

    Reset() {
      this.targetState = !this.targetState
      this.headerText.text.value = 'TURN EVERYTHING ' + (this.targetState? 'ON' : 'OFF')

      MiniGame.prototype.Reset.apply(this)
    }

    SetupSwitches() {
        const spaceBetweenSwitches = 66
        const startingPos = new Vector2(-150, -175)

        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            const newSwitch = this.prompt.addSwitch('', startingPos.x + column * spaceBetweenSwitches, startingPos.y + row * spaceBetweenSwitches,
              () => {
                // log('switch deactivated')
                if(!this.targetState) {
                  this.AddSuccess(1)
                } else {
                  this.AddSuccess(-1)
                }
              },
              () => {
                // log('switch activated')
                if(this.targetState) {
                  this.AddSuccess(1)
                } else {
                  this.AddSuccess(-1)
                }
              }, SwitchStyles.ROUNDRED, this.targetState
            )
            
            this.switches.push(newSwitch)
          }
        }
        
        this.UpdateSuccessText()
    }
}