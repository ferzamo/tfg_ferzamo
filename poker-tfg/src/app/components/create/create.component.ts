import { Component, OnInit } from '@angular/core';
import { GameService } from '../../shared/services/api/game.service';
import {Game} from '../../models/game';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.less']
})
export class CreateComponent implements OnInit {

  public game: Game;

  constructor( private _gameService: GameService ) { 
    
  }

  ngOnInit(): void {

    console.log("entra");
    this.game = new Game("hola", 2, 3, "sdass", "sdass", "sdass", "sdass", "sdass");
    this._gameService.createGame(this.game).subscribe();

  }

}
