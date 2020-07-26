import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";


@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.less"],
})
export class GameComponent implements OnInit {
  public minSlider: number;
  public maxSlider: number;
  public sliderValue: number;

  public players: Player[] = [];
  public realPlayers: number[] = [];
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;

  public canICheck: boolean;
  public canIRaise: boolean;
  public showDown = false;

  public info: string[] = [];
  public blindDate: Date;


  
  




  

  

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketioService,
    private _loadingService: LoadingService
  ) {
    if (
      !(JSON.parse(sessionStorage.getItem("player")) === null) &&
      JSON.parse(sessionStorage.getItem("player")).game ===
        this.route.snapshot.paramMap.get("gameId")
    ) {
      this.game = new Game(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null, 
        []
      );
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));
      
    } else {
      this.router.navigateByUrl("/");
    }
  }

 

  ngOnInit(): void {
    this.getPlayers();
    this.getGame();
    this.blindDate = new Date();

    this._socketService.playerConnection(this.unPlayer);
   
     
    this._socketService.startYourTurn().subscribe(()=>{
      
      this.blindDate = new Date();
      

      this.showDown = false;
      this.getPlayers();
      this.getGame();
  
   
    });

    this._socketService.showDown().subscribe(()=>{

      this.showDown = true
      
    })

    this._socketService.getInfo().subscribe((res)=>{
        if(this.info.length == 5){
          for(let i=1; i<this.info.length; i++){
            this.info[i-1]=this.info[i];

          }
          this.info[4]=res;
        }else{
          this.info.push(res)
        }
        
        
    })

  }



  
  
  fold() {
    this.unPlayer.myTurn = false;
    this.unPlayer.playing = false;
    this.unPlayer.card1 = null;
    this.unPlayer.card2 = null;
    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
      this._socketService.sendInfo(this.unPlayer,this.unPlayer.name + ' folds');
      this._socketService.myTurnIsOver(this.unPlayer);
    });
  }

  call() {
    this.unPlayer.myTurn = false;

    if(this.unPlayer.bet !== this.game.highestBet){
      this.unPlayer.stack = this.unPlayer.stack - this.game.highestBet + this.unPlayer.bet;
      this.game.pot = this.game.pot + this.game.highestBet - this.unPlayer.bet;
      this.unPlayer.bet = this.game.highestBet;

    }

    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
     
        this._gameService.updateGame(this.game).subscribe(()=>{
          if(this.canICheck) this._socketService.sendInfo(this.unPlayer,this.unPlayer.name + ' checks ');
          else this._socketService.sendInfo(this.unPlayer,this.unPlayer.name + ' calls ' + this.unPlayer.bet);
          
          this._socketService.myTurnIsOver(this.unPlayer);
        });
     
    });
  }

  raise() {
    this.unPlayer.myTurn = false;

    this.unPlayer.stack = this.unPlayer.stack - Number(this.sliderValue) + this.unPlayer.bet;

    this.game.pot = this.game.pot + Number(this.sliderValue) - this.unPlayer.bet;
  
    this.unPlayer.bet = Number(this.sliderValue);
   

    this.game.highestBet = this.unPlayer.bet;

    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
      
        this._gameService.updateGame(this.game).subscribe(()=>{
          if(this.canIRaise) this._socketService.sendInfo(this.unPlayer,this.unPlayer.name + ' raises ' + this.unPlayer.bet);
          else this._socketService.sendInfo(this.unPlayer,this.unPlayer.name + ' bets ' + this.unPlayer.bet);
          this._socketService.myTurnIsOver(this.unPlayer);
        });
      });
    
  }

  getPlayers() {
   
    this._playerService.getPlayers(this.gameURL).subscribe((res) => {
      
      this.players = res["players"];
      
      this.unPlayer = this.players[this.unPlayer.position-1];

      
      
      
      this.players.splice(this.unPlayer.position - 1, 1);
      this.players.forEach((player) => {

        var positionBefore = player.position;
        player.position = (9 - (this.unPlayer.position - player.position)) % 9;
        this.realPlayers[player.position] = positionBefore;
      });

      

     
      
    });
  }

  getGame(){
    this._gameService.getGame(this.gameURL).subscribe((res) => {
      this.game = res["game"];
      
      if(this.game.highestBet===this.unPlayer.bet || this.game.highestBet===0){
        this.canICheck = true;
      }else{
        this.canICheck = false;
      }

      if(this.game.highestBet===0){
        this.canIRaise = false;
      }else{
        this.canIRaise = true;
      }
      this.minSlider = this.game.highestBet + this.game.blind[0].value;
      this.maxSlider = this.unPlayer.stack;
      this.sliderValue = this.minSlider;

      
      
    });
  }

  getRealPosition(position){

    return position;

  }

  firstItem(item){
    if (item==0) return true;
    else return false;
  }

  phraseWinner(phrase){
    if (phrase.includes(' wins ')) return true;
    else return false;
  }
  

  
   
}
