import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { DeckService } from "../../shared/services/api/deck.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { finalize } from "rxjs/operators";
import { delay } from "rxjs/operators";

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
    private _deckService: DeckService,
    private _playerService: PlayerService,
    private _loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Game initialized
    this.game = new Game(
      null,
      "Normal",
      10000,
      0,
      500,
      null,
      null,
      null,
      null,
      null,
      "pregame",
      null
    );
    // Player initialized with position 1 by default, playing true because he starts the first hand playing and dealer true
    this.player = new Player(
      null,
      "",
      null,
      1,
      null,
      0,
      null,
      null,
      true,
      false,
      true,
      false,
      false,
      false
    );
  }

  onClick() {
    if (this.game.stack > 0 && this.player.name !== "") {

      // Once the button is clicked, the game is created and the loading spin is shown till it ends
      this._loadingService.show();
      this._gameService
        .createGame(this.game)
        .pipe(delay(700))
        .pipe(finalize(() => this._loadingService.hide()))
        .subscribe(
          (res) => {
            this.game = res["game"];
            // The game id and stack of the game is asigned to the player created
            this.player.game = this.game._id;
            this.player.stack = this.game.stack;

            // Deck is initialized
            this._deckService.createDeck(this.game).subscribe();

            // First player of the game is created
            this._playerService.createPlayer(this.player).subscribe((res) => {
              this.player = res["player"];

              // Player info is stored in session to be reused later
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
}
