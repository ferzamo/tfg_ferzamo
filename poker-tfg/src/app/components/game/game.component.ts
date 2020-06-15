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
  public realPlayers: Player[] = [];
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;

  public bigBlind = 500;
  public canICheck: boolean;
  public canIRaise: boolean;

  public showDown = false;
  




  

  

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
        null
      );
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));
      
    } else {
      this.router.navigateByUrl("/");
    }
  }

 

  ngOnInit(): void {

    this._socketService.playerConnection(this.unPlayer);
    this.getPlayers(false);
    this.getGame();
     
    this._socketService.startYourTurn().subscribe(()=>{
      
      this.showDown = false;
      this.getPlayers(this.showDown);
      this.getGame();
  
   
    });

    this._socketService.showDown().subscribe(()=>{

      this.showDown = true
      this.getPlayers(this.showDown);
      this.getGame();
    })

  }



  
  
  fold() {
    this.unPlayer.myTurn = false;
    this.unPlayer.playing = false;
    this.unPlayer.card1 = null;
    this.unPlayer.card2 = null;
    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
      
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
          this._socketService.myTurnIsOver(this.unPlayer);
        });
      });
    
  }

  getPlayers(showdown: boolean) {
   
    this._playerService.getPlayers(this.gameURL).subscribe((res) => {
      
      this.players = res["players"];
      
      this.unPlayer = this.players[this.unPlayer.position-1];

      
      

      this.players.splice(this.unPlayer.position - 1, 1);
      this.players.forEach((player) => {
        if(!showdown){
          //player.card1 = "back";
          //player.card2 = "back";
        }
        
        player.position = (9 - (this.unPlayer.position - player.position)) % 9;
      });
      console.log(this.players);
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
      this.minSlider = this.game.highestBet + this.bigBlind;
      this.maxSlider = this.unPlayer.stack;
      this.sliderValue = this.minSlider;
      
    });
  }
  

  
   
}
