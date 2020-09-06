import { MiniGame } from "./MiniGameMachine"

export class WordTyper extends MiniGame {
    randomWords = ['HOLY', 'MOLLY', 'SALMONOMICON', 'DECENTRALAND', 'SCIFI', 'DROID', 'ROBOT', 'AIR', 'MARS', 'KITCHEN', 'CHIPA', 'PHILIP', 'HACKATHON', 'MANA', 'LAND', 'SYNTHWAVE', 'JOJO']
    currentChallengeWord = ""
    inputBox = this.prompt.addTextBox(0, -150, "type word here", (e) => {})
  
    constructor(onWinCallback: () => any) {
      super(onWinCallback)
  
      this.prompt.close()
      this.UpdateHeaderText()
  
      this.inputBox.fillInBox.onTextSubmit = new OnTextSubmit((x) => {
        const submittedText = x.text
      
        if(submittedText.localeCompare(this.currentChallengeWord) === 0) {
          this.AddSuccess(1)
        }
      
        this.UpdateHeaderText()
      })
    }
  
    UpdateHeaderText() {
      this.currentChallengeWord = this.GetRandomWord()
      this.headerText.text.value = 'TYPE THE NEXT WORD: ' + this.currentChallengeWord
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