import { MiniGame } from "./MiniGameMachine"
import { ButtonStyles } from "../../node_modules/@dcl/ui-utils/utils/types"

export class BugClicker extends MiniGame {
    randomPositions = []
    successesNeeded = 5
    bugRepositionDelay = 0
    headerText = this.prompt.addText('CLICK THE BUGS! ', 0, 250, Color4.Green(), 40)
    bugButton = this.prompt.addButton('',0,0, 
      () => {
        this.AddSuccess(1)

        this.RepositionBug()
      },
      ButtonStyles.ROUNDSILVER
    )
  
    constructor(onWinCallback: () => any) {
      super(onWinCallback)

      this.bugButton.image.width = 30
      this.bugButton.image.height = 30
      this.RepositionBug()

      this.prompt.close()
    }

    Update(dt: number) {
      if(!this.started) return

      this.bugRepositionDelay -= dt

      if(this.bugRepositionDelay <= 0) {
        this.bugRepositionDelay = Scalar.RandomRange(0.4, 0.9)
        this.RepositionBug()
      }
    }

    RepositionBug() {
      this.bugButton.image.positionX = Scalar.RandomRange(-this.promptWidth/2.5, this.promptWidth/2.5)
      this.bugButton.image.positionY = Scalar.RandomRange(-this.promptHeight/3, this.promptHeight/3)
    }
}