import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { finalize } from "rxjs/operators";
import { map } from 'rxjs/operators';

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
  public playersOrder: Player[] = []
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;
  public prueba2 = 'heart_9';

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
    this._gameService.getGame(this.gameURL)
      .pipe(finalize(() => this._loadingService.hide()))
      .subscribe(
        (res) => {
          this.game = res["game"];

          this._playerService.getPlayers(this.game._id).subscribe((res) => {
            this.players = res["players"];
            this.players.splice(this.unPlayer.position - 1, 1);
            this.players.forEach((player) => {
              player.position = (9 - (this.unPlayer.position - player.position)) % 9;
            });
            this.players[0].card1 = 'heart_4';
            this.players[0].card2 = 'diamond_4';
            this.players[1].card1 = 'heart_5';
            this.players[1].card2 = 'diamond_5';
            this.players[2].card1 = 'heart_6';
            this.players[2].card2 = 'diamond_6';


          });
        },
        (error) => {
          this.router.navigateByUrl("/");
        }
      );



  }

}
