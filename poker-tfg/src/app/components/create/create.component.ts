import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";

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
    
    private router: Router
  ) {}

  ngOnInit(): void {
    this.game = new Game(null, null, 0, null, null, null, null, null, null);
    this.player = new Player(null, null, null, 1, null, null, null);
  }

  onClick() {
    this._gameService.createGame(this.game).subscribe(
      (res) => {
        this.game = res["game"];
        this.player.game = this.game._id;
        this.player.stack = this.game.stack;
        this._playerService.createPlayer(this.player).subscribe();

        localStorage.setItem('game', JSON.stringify(this.game));
        localStorage.setItem('player', JSON.stringify(this.player))

        this.router.navigateByUrl('/' + this.game._id + '/lobby');
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
