import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { delay } from "rxjs/operators";
import { finalize } from 'rxjs/operators';
import { tap } from 'rxjs/operators';


@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.less"],
})
export class LobbyComponent implements OnInit {
  public game: Game;
  public gameURL: string;

  // All players in the game
  public players: Player[] = [];

  // The actual player
  public unPlayer: Player;

  // Needed to keep free space in the lobby with a "Waiting player" label
  public playersWaiting;

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketioService,
    private _loadingService: LoadingService
  ) {
    // It doesnt let you in if your session storage id of the game is not the same of the URL. It means that you need either to create or to join the game to get in
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
        null
      );

      // Player info is retrieved from session storage
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));

      // It awaits for a new player to be connected to add id in the players array and reduce the playersWaiting
      this._socketService.playerConnectionBroadcast().subscribe((res) => {
        if (!this.players.some((e) => e._id === res._id)) {
          this.players.push(res);
          this.playersWaiting.pop();
        }
      });

      // When a player closes the window or the tab it will delete this players from the database and broadcast this to every other player in the game, if his position is lower than the player position that received this message. This player will subtract 1 to his position
      this._socketService.playerDisconnectedBroadcast().subscribe((res) => {
        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          this.players = res["players"];

          this.players.forEach((player) => {
            if (this.unPlayer._id === player._id) {
              this.unPlayer = player;
              sessionStorage.setItem("player", JSON.stringify(this.unPlayer));
            }
          });

          this.playersWaiting = Array(9 - this.players.length)
            .fill(0)
            .map((x, i) => i);
        });
      });
    } else {
      this.router.navigateByUrl("/");
    }
  }

  ngOnInit(): void {
    // Sends the message to the back that this new player is connected
    this._socketService.playerConnection(this.unPlayer);

    // Gets game and players data. It fill the playersWaiting array till players + playersWaiting = 9 (max number of players)
    this._gameService.getGame(this.gameURL).subscribe(
      (res) => {
        this.game = res["game"];

        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          this.players = res["players"];

          this.playersWaiting = Array(9 - this.players.length)
            .fill(0)
            .map((x, i) => i);
        });
      },
      (error) => {
        this.router.navigateByUrl("/");
      }
    );

    this._socketService
      .startGameBroadcast()
      .pipe(tap(()=>this._loadingService.show()), delay(700))
      .subscribe((res) => {
        this.router.navigateByUrl("/" + this.gameURL);
      });
  }

  public startGame() {
    // Broadcast the start of the game for every player

    this._gameService.createBlindTable(this.game).subscribe(() => {
      this._socketService.startGame(this.unPlayer);
    });
  }
}
