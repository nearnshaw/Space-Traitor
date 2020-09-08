export class MusicPlayer extends Entity {
  constructor() {
    super('Equipment')

    this.addComponent(new Transform())
    engine.addEntity(this)

    this.setParent(Attachable.PLAYER)
  }

  playSong(song: string, vol?: number, noLoop?: boolean) {
    if (this.hasComponent(AudioSource)) {
      this.getComponent(AudioSource).playing = false
    }

    let songClip = new AudioClip('sounds/' + song)

    const source = new AudioSource(songClip)

    if (noLoop) {
      source.loop = false
    } else {
      source.loop = true
    }

    source.volume = vol ? vol : 1

    this.addComponentOrReplace(source)
    source.playing = true
  }

  silence() {
    this.getComponent(AudioSource).playing = false
  }
}
