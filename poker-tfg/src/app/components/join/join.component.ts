import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";
import { LoadingService } from '../../shared/services/loading/loading.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-join",
  templateUrl: "./join.component.html",
  styleUrls: ["./join.component.less"],
})
export class JoinComponent implements OnInit {
  public player: Player;
  public game: Game;
  public lastPosition: number;

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private router: Router,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.game = new Game(null, null, null, null, null, null, null, null, null, null);
    this.player = new Player(null, null, null, null, null, 0, null, null, true, false, false, false);
  }

  onClick() {

    // If there is a game with that ID, it will take all the players related to, it will asign a position according to the number of players already and will store the new created player in the session storage. If the game is full (9 players) or there is no game with that ID, it will redirect
    this.loadingService.show();
    this._gameService.getGame(this.game._id)
    .pipe(finalize(() => this.loadingService.hide()))
    .subscribe(
      (res) => {
        this.game = res["game"];
        
        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          this.lastPosition = res["players"].length;

          if (this.lastPosition !== 9) {
            this.player.position = this.lastPosition + 1;
            this.player.game = this.game._id;
            this.player.stack = this.game.stack;
            this._playerService.createPlayer(this.player).subscribe((res) => {
              this.player = res["player"];
              sessionStorage.setItem("player", JSON.stringify(this.player));

              this.router.navigateByUrl("/" + this.game._id + "/lobby");
            });
          } else {
            this.router.navigateByUrl("/");
          }
        });
      },
      (error) => {
        this.router.navigateByUrl("/");
      }
    );
  }
}
