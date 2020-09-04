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

// let minigameMachineEntity = new Entity()
// minigameMachineEntity.addComponent(
//   new Transform({
//     position: new Vector3(8, 1, 8),
//   })
// )
// minigameMachineEntity.addComponent(
//   new MiniGameMachine(minigameMachineEntity)
// )
// minigameMachineEntity.addComponent(new BoxShape())
// engine.addEntity(minigameMachineEntity)