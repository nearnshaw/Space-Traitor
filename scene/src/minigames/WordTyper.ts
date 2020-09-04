import { MiniGame } from "./MiniGameMachine"
import * as ui from '../../node_modules/@dcl/ui-utils/index'
import { PromptStyles } from "../../node_modules/@dcl/ui-utils/utils/types"

export class WordTyper extends MiniGame {
    randomWords = ['HOLLY', 'MOLLY', 'SALMONOMICON', 'DECENTRALAND', 'SCIFI', 'DROID', 'ROBOT', 'AIR', 'MARS']
    successesNeeded = 3
    currentSuccesses = 0
    prompt = new ui.CustomPrompt(PromptStyles.DARK, 800, 600)
    currentChallengeWord = ""
    headerText = this.prompt.addText('TYPE THE NEXT WORD: ', 0, 260, Color4.Green(), 30)
    successesText = this.prompt.addText('SUCCESS: 0/' + this.successesNeeded, 0, 0, Color4.Yellow(), 20)
    inputBox = this.prompt.addTextBox(0, -150, "type word here", (e) => {})
  
    constructor() {
      super()
  
      this.prompt.close()
      this.UpdateHeaderText()
  
      this.inputBox.fillInBox.onTextSubmit = new OnTextSubmit((x) => {
        const submittedText = x.text
      
        if(submittedText.localeCompare(this.currentChallengeWord) === 0) {
          this.currentSuccesses++
      
          this.UpdateSuccessText()
      
          if(this.currentSuccesses == this.successesNeeded) {
            this.prompt.close()
            return
          }
        }
      
        this.UpdateHeaderText()
      })
    }
  
    Start() {
     this.Reset()
     this.prompt.reopen()
    }
  
    Reset() {
      this.currentSuccesses = 0
    }
  
    UpdateHeaderText() {
      this.currentChallengeWord = this.GetRandomWord()
      this.headerText.text.value = 'TYPE THE NEXT WORD: ' + this.currentChallengeWord
    }
    
    UpdateSuccessText() {
      this.successesText.text.value = 'SUCCESS: ' + this.currentSuccesses + "/" + this.successesNeeded
    }
  
    GetRandomWord(): string {
      let finalWord = ""
      
      const randomIndex = Math.floor(Scalar.RandomRange(0, this.randomWords.length))
      
      const selectedWord = this.randomWords[randomIndex]
      
      // Randomize upper-lower casing
      for (let index = 0; index < selectedWord.length; index++) {
        const currentChar = selectedWord.charAt(index);
        finalWord += Scalar.RandomRange(0, 1) > 0.5 ? currentChar.toUpperCase() : currentChar.toLowerCase()
      }
      
      return finalWord
    }
  }