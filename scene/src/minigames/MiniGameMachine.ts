import { WordTyper } from "./WordTyper"

export class MiniGame {
  Start() {

  }
}

@Component('miniGameMachine')
export class MiniGameMachine {
  minigame: MiniGame
  
  constructor(entity: Entity) {
    // TODO: Randomize instantiated MiniGame type
    this.minigame = new WordTyper()

    entity.addComponent(
      new OnPointerDown(async () => {
        this.minigame.Start()
      }))
  }
}