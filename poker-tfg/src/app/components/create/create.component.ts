import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";
import { LoadingService } from '../../shared/services/loading/loading.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.less"],
})
export class CreateComponent implements OnInit {
  public game: Game;
  public player: Player;

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.game = new Game(null, null, 0, null, null, null, null, null, null);
    this.player = new Player(null, null, null, 1, null, null, null);
  }

  onClick() {
    this.loadingService.show();
    this._gameService.createGame(this.game)
    .pipe(finalize(() => this.loadingService.hide()))
    .subscribe(
      (res) => {
        this.game = res["game"];
        this.player.game = this.game._id;
        this.player.stack = this.game.stack;
        this._playerService.createPlayer(this.player)
        .subscribe((res) => {
          this.player = res["player"];
          
          sessionStorage.setItem("player", JSON.stringify(this.player));
          

          this.router.navigateByUrl("/" + this.game._id + "/lobby");
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
