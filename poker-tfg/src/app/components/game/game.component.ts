import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { finalize } from "rxjs/operators";
import { DeckService } from "../../shared/services/api/deck.service";


@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.less"],
})
export class GameComponent implements OnInit {
  public minSlider = 500;
  public maxSlider = 1000;
  public sliderValue = this.minSlider;

  public players: Player[] = [];
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;

  

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private _deckService: DeckService,
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
        null
      );
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));

      
      
    } else {
      this.router.navigateByUrl("/");
    }
  }

  ngOnInit(): void {
    this._loadingService.show();
    this._gameService
      .getGame(this.gameURL)
      .pipe(finalize(() => this._loadingService.hide()))
      .subscribe(
        (res) => {
          this.game = res["game"];

          this.getPlayers(this.game._id);
        },
        (error) => {
          this.router.navigateByUrl("/");
        }
      );
  }

  ngAfterViewInit() {
    if (this.unPlayer.position === 1) {
      this._deckService.populateDeck(this.gameURL).subscribe(() => {
        this.getCards();
      });
    }

    this._socketService.startYourTurn().subscribe((res) => {
      
      
      this.getPlayers(this.route.snapshot.paramMap.get("gameId"));

      //Calcula la posicion que le ha llegado a ver si es la suya
      var position =
 Number(res) % JSON.parse(sessionStorage.getItem("numPlayers"));
      
      

      if (
        position === 0 &&
        this.unPlayer.position ===
          JSON.parse(sessionStorage.getItem("numPlayers"))
      ) {
        position = this.unPlayer.position;
      }

      
      if(this.unPlayer.position === position && this.unPlayer.playing===true){
       
        if (this.unPlayer.card1 === null ) {
          
          this.getCards();
        }else{
          
          this.unPlayer.myTurn = true;
          this._playerService.updateplayer(this.unPlayer).subscribe(() => {
            this._socketService.iChangedSomething(this.unPlayer);
          });
          
        }
      }else if(this.unPlayer.position === position && this.unPlayer.playing===false){
        this._socketService.myTurnIsOver(this.unPlayer);
      }

      

    
    });

    this._socketService.checkSomethingChanged().subscribe(() => {
        console.log('checkSomethingChanged');
        this.getPlayers(this.route.snapshot.paramMap.get("gameId"));
    })
  }

  
 
  fold() {
    this.unPlayer.myTurn = false;
    this.unPlayer.playing = false;
    this._playerService.updateplayer(this.unPlayer).subscribe(() => {
      this._socketService.myTurnIsOver(this.unPlayer);
    });
    
    
  }

  check(){
    this.unPlayer.myTurn = false;
    this._playerService.updateplayer(this.unPlayer).subscribe();
    this._socketService.myTurnIsOver(this.unPlayer);
    
  }

  raise(){

  }

  getCards() {
    this._deckService.getCard(this.gameURL).subscribe((res) => {
      this.unPlayer.card1 = res["card"].name;
      this._deckService.getCard(this.gameURL).subscribe((res) => {
        this.unPlayer.card2 = res["card"].name;
        
        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  getPlayers(gameId: string){
    this._playerService.getPlayers(gameId).subscribe((res) => {
      this.players = res["players"];

      this.players.splice(this.unPlayer.position - 1, 1);
      this.players.forEach((player) => {
        player.card1 = "back";
        player.card2 = "back";
        player.position =
          (9 - (this.unPlayer.position - player.position)) % 9;
          console.log(this.players)
      });
    });
  }
}
