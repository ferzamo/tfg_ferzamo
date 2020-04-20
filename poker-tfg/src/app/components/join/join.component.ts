import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.game = new Game(null, null, null, null, null, null, null, null, null);
    this.player = new Player(null, null, null, null, null, null, null);
  }

  onClick() {
    this._gameService.getGame(this.game._id).subscribe(
      (res) => {
        this.game = res["game"];

        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          this.lastPosition = res["players"].length;

          if (this.lastPosition!== 8) {
            this.player.position = this.lastPosition + 1;
            this.player.game = this.game._id;
            this.player.stack = this.game.stack;
            this._playerService.createPlayer(this.player).subscribe();

            localStorage.setItem("game", JSON.stringify(this.game));
            localStorage.setItem("player", JSON.stringify(this.player));

            this.router.navigateByUrl("/" + this.game._id + "/lobby");
          }else{
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
