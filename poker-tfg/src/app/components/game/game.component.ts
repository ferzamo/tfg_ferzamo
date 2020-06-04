import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { Move } from "../../models/move";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { finalize } from "rxjs/operators";
import { DeckService } from "../../shared/services/api/deck.service";
import { MoveService } from "../../shared/services/api/move.service";

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
  public realPlayers: Player[] = [];
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;
  public bigBlind = 500;

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private _deckService: DeckService,
    private _moveService: MoveService,
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
        null
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

  check() {
    this.unPlayer.myTurn = false;
    this.unPlayer.checked = true;
    this.unPlayer.bet = this.sliderValue;
    var myMove = new Move(this.unPlayer._id, this.sliderValue);
    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
      this._moveService.insertMove(this.game._id, myMove).subscribe(() => {
        
        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  raise() {
    this.unPlayer.myTurn = false;
    this.unPlayer.checked = false;
    this.unPlayer.bet = this.sliderValue;
    this._socketService.iRaised(this.unPlayer);
    var myMove = new Move(this.unPlayer._id, this.unPlayer.bet);
    this._playerService.updatePlayer(this.unPlayer).subscribe(() => {
      this._moveService.insertMove(this.game._id, myMove).subscribe(() => {
        
        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  

  getPlayers() {
   
    this._playerService.getPlayers(this.gameURL).subscribe((res) => {
      
      this.players = res["players"];
      console.log(this.players);
      this.unPlayer = this.players[this.unPlayer.position-1];
      console.log(this.unPlayer);

      this.players.splice(this.unPlayer.position - 1, 1);
      this.players.forEach((player) => {
        player.card1 = "back";
        player.card2 = "back";
        player.position = (9 - (this.unPlayer.position - player.position)) % 9;
      });
    });
  }

  getGame(){
    this._gameService.getGame(this.gameURL).subscribe((res) => {
      this.game = res["game"];
    });
  }

  
   
}
