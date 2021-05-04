import { Room, Client } from "colyseus";
import { FIXES_TO_WIN, GAME_DURATION, MINIMUM_PLAYERS, randomBreakProbability, sabotagePenalty, VOTING_TIME } from "../config";
import {  MyRoomState, Player,  JoinData, EquiptmentChange, FuseChange, Vote } from "./MyRoomState";

const ROUND_DURATION = 60;
// const ROUND_DURATION = 30;

// const MAX_BLOCK_HEIGHT = 5;


export class MyRoom extends Room<MyRoomState> {
  private currentHeight: number = 0;
  private isFinished: boolean = false;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    // this.setPatchRate(33)  > 30 fps   (default 20 fps)

    // set-up the game!
    this.reset();

    this.onMessage("join", (client: Client, atIndex: number) => {
      // set player new position
      const player = this.state.players.get(client.sessionId);

    });

    this.onMessage("ready", (client: Client, data:JoinData) => {
      if(this.state.active){
        this.send(client, "msg", "Wait for the current game to end")
        return
      }
   
      const player = this.state.players.get(client.sessionId);
  
      if(player.ready){
        this.send(client, "msg", "You're already in the game. Waiting for other players.")
        return
      }

      player.ready = true
      player.alive = true


      if(data.thumb){
        player.thumb = data.thumb
      }

      let playerCount:number = 0

      this.state.players.forEach(player => {
        if(player.ready) playerCount+=1
      });

      console.log(player.name, "is ready! ",  playerCount, " players ready so far" );
  
      if(playerCount > MINIMUM_PLAYERS){

        this.clock.clear();
        console.log("Starting new game on room ", this.roomId, " with ", playerCount, " players")
        this.setUp()
      }else {
        let message = playerCount + " players read. At least " + MINIMUM_PLAYERS + " required. Invite your fiends/nemesis!"
        this.broadcast(message)
      }
  
    })


    this.onMessage("shipChange", (client: Client, data:EquiptmentChange) => {
     
      const player = this.state.players.get(client.sessionId);

      if(!this.state.active){
        return
      }

      if(player.isTraitor && !data.broken) return

      if(!player.isTraitor && data.broken) return


      this.state.toFix[data.id].broken = data.broken

      if (!data.broken) {
        this.state.fixCount += 1
        if ( this.state.fixCount >= FIXES_TO_WIN) {
          this.end()
        }
      }

    })


    this.onMessage("FuseBoxChange", (client: Client, data:FuseChange) => {
      if(!this.state.active){
        return
      }

      const player = this.state.players.get(client.sessionId)

      let box = this.state.fuseBoxes[data.id]

      if(data.doorOpen && data.doorOpen != box.doorOpen ){
        box.doorOpen = data.doorOpen
      }

      if(box.broken) return

      if(player.isTraitor){
        if (!box.redCut && data.redCut) {
          box.redCut = true
        }
        if (!box.blueCut && data.blueCut) {
         box.blueCut = true
        }
        if (!box.greenCut && data.greenCut) {
         box.greenCut = true
        }

        if(box.redCut && box.blueCut && box.greenCut){

          this.state.countdown -= sabotagePenalty
          box.broken = true

        }
      } else {
        this.send(client, "msg", "Only a traitor would sabotage their own ship like that.")

      } 
    })

    this.onMessage("startvote", (client: Client) => {
      if(!this.state.active || this.state.paused){
        console.log("room inactive or already voting")
        return
      }

      let playersAlive: number = 0

      this.state.players.forEach(player => {
        if (player.alive) playersAlive ++
      })

      if(playersAlive <= 2 ){
        this.broadcast("msg", "too few players left to vote")
        return
      }else {
        this.state.paused = true
        this.state.votingCountdown = VOTING_TIME
        this.state.players.forEach(player => {
          player.votes = []
        });

  
        this.broadcast("start-vote",{
          timeLeft: VOTING_TIME,
          players: this.state.players
        })

      }
    })

    this.onMessage("vote", (client: Client, data:Vote) => {
      if(!this.state.active || !this.state.paused){
        console.log("room inactive or not paused")
        return
      }

      const voter = this.state.players.get(data.voter)
      const voted = this.state.players.get(data.voted)

      if(!voter.alive || !voter.ready) return

     voted.votes.push(data.voter)


     let voteCount = 0
     this.state.players.forEach(player => {
      voteCount += player.votes.length
     })

     let playersAlive: number = 0
     this.state.players.forEach(player => {
       if (player.alive) playersAlive ++
     })


     if (voteCount >= playersAlive) {
       this.endVotes()
     } else {
       console.log(
         'We have ',
         voteCount,
         ' votes, we need ',
         playersAlive
       )
     }

    })

  }


  endVotes(){

    // TODO
    this.state.paused = false

    let playersAlive: number = 0
    let mostVotesAgainst = 0
    let playerWithMostVotes: Player = null
    let weHaveATie: boolean = false
    let traitorKilled : boolean = false

    this.state.players.forEach(player => {
      if (player.alive) playersAlive ++
      let votesAgainst = player.votes.length
      if(votesAgainst > mostVotesAgainst) {
        playerWithMostVotes = player
        mostVotesAgainst = votesAgainst
        weHaveATie = false 
        if(player .isTraitor){
          traitorKilled = true
        } else {
          traitorKilled = false
        }
      } else if (votesAgainst == mostVotesAgainst){
        weHaveATie = true
      }
    })

    if(weHaveATie){
      console.log("it's a tie! ", mostVotesAgainst)
      this.broadcast("endvote", {voted: null, wasTraitor: false})
      return
    } else if(playerWithMostVotes && playerWithMostVotes.alive){

      console.log('We have a victim! ', playerWithMostVotes, " is traitor? ", playerWithMostVotes.isTraitor)
      playerWithMostVotes.alive = false
    }

     playersAlive = 0
     this.state.players.forEach(player => {
      if (player.alive) playersAlive ++
     })

    setTimeout(() => {
      if (playersAlive < 2 || traitorKilled ) {
        this.end()
      } else {
        this.broadcast("endvote", {voted: playerWithMostVotes.name, wasTraitor: traitorKilled})
        this.state.paused = false
      }
    }, 3000)
  }



  pickTraitor() {

    let currentPlayers = 0
    this.state.players.forEach(player => {
      if (player.ready) currentPlayers ++
    })


    const rnd = Math.floor(Math.random() * currentPlayers) 

    const traitor = this.clients[rnd]

    const traitorPlayer = this.state.players.get(traitor.id)


    traitorPlayer.isTraitor = true
    this.state.traitors = 1
    console.log(
      'Player ',
      rnd,
      ' , ',
      traitorPlayer.name,
      ' is the traitor, id: ',
      traitor.id
    )

  }



  setUp() {


    this.isFinished = false;
    this.state.paused = false;
   

    this.state.fuseBoxes.forEach(box => {
      box.reset()
    });

    this.state.toFix.forEach(equipt => {
      equipt.reset()
    });


  
    this.broadcast("msg", {text:"Game starts in ..." } );

    this.state.countdown = 3;

    // make sure we clear previous interval
    this.clock.clear();

    this.clock.setTimeout(() => {

      this.broadcast("msg", {text: "3"} );
    
    }, 2000);

    this.clock.setTimeout(() => {

      this.broadcast("msg", {text: "2"});
    
    }, 4000);


    this.clock.setTimeout(() => {

      this.broadcast("msg", {text: "1"} );
    
    }, 6000);


    this.clock.setTimeout(() => {

     this.startGame()
    
    }, 8000);

  }

  startGame(){

    // pick traitor
    this.pickTraitor()


    // Maybe I can just add a listener in the scene
    this.state.players.forEach(player => {
      if(player.isTraitor){
        
        //this.send( this.clients[player.], "msg",'You are the treasoning android!')
      } else {
         //this.send(this.clients[player.],  "msg",'One of your mates is a treacherous android.')
      }
    });

    

    // maybe I dont need this eiter, listener to active = true
    this.broadcast("new", {duration:ROUND_DURATION }  );

    this.state.active = true

    // setup round countdown
    this.state.countdown = GAME_DURATION;
    this.state.votingCountdown = VOTING_TIME;

    // make sure we clear previous interval
    this.clock.clear();

    this.clock.setInterval(() => {

      if(!this.isFinished) return
      // normal countdown
      if ( !this.state.paused ) {

        if(this.state.countdown > 0){
          this.state.countdown--;
          let randomBreak = Math.random()
          if (randomBreak < 1 / randomBreakProbability) {
            this.randomBreakEquipt()
          }

        } else {
        // countdown reached zero! end the game!
        this.end()
        this.clock.clear();  
       
      }

    } else if (this.state.paused) {
      // voting countdown
      if(this.state.votingCountdown > 0) {
        this.state.votingCountdown --
      } else {
        this.endVotes()
      }

    }


    }, 1000);
    
  }

  end(){

    this.state.active = false
    this.state.paused = false
    this.isFinished = true

    let traitorAlive = true

    this.state.players.forEach(player => {
      if(player.isTraitor && !player.alive) traitorAlive = false
    });

  
    let traitorWon =
     this.state.fixCount < FIXES_TO_WIN && traitorAlive ? true : false
  
     console.log(
      'FINISHED GAME in room ',
      this.roomName,
      ' time remaining: ',
     this.state.countdown,
      ' fix count: ',
     this.state.fixCount,
      ' traitor won: ',
      traitorWon
    )


    this.broadcast("end", {traitorWon: traitorWon, fixCount: this.state.fixCount, timeLeft:  this.state.countdown});


    // reset after 10 seconds
   
    this.clock.setTimeout(() => {
      
      this.reset();
      this.broadcast("reset")
         
    }, 10000);

  
  }

  reset(){

    this.state.players.clear()

    this.state.active = false

    this.state.fuseBoxes.forEach(box => {
      box.reset()
    });
 
    this.state.toFix.forEach(equipt => {
     equipt.reset()
   });

    this.state.players.forEach((player) => {
      player.ready =false
      player.alive = false
      player.isTraitor = false
    });

    this.state.fixCount = 0
    this.state.traitors = 0
    this.state.countdown = GAME_DURATION
    this.state.votingCountdown = VOTING_TIME
  }

  randomBreakEquipt(){
    let attempts = 0
    let brokeSomething = false
    while (!brokeSomething) {
      let randomI = Math.floor(Math.random() * this.state.toFix.length)

      if (!this.state.toFix[randomI].broken) {
        this.state.toFix[randomI].broken = true
        brokeSomething = true
        console.log('Randomly breaking equiptment ', randomI)
      } else {
        attempts++
        if (attempts > 10) {
          brokeSomething = true
        }
      }
    }
  }




  onJoin (client: Client, options: any) {

    const newPlayer = new Player( options.userData.displayName || "Anonymous", options.thumb || null )
    this.state.players.set(client.sessionId, newPlayer);

    console.log(newPlayer.name, "joined! => ", options.userData);
  }



  onLeave (client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(player.name, "left!");



    this.state.players.delete(client.sessionId);

    let playersAlive: number = 0
    this.state.players.forEach(player => {
      if (player.alive) playersAlive ++
    })

    if( this.state.active && playersAlive <= 1){
      this.end()
    }
  }

  onDispose() {
    console.log("Disposing room...");
  }

}
