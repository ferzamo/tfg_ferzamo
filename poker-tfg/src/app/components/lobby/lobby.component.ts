import { Component, OnInit } from '@angular/core';
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.less']
})
export class LobbyComponent implements OnInit {

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  public game: Game;
  public players: Player [];
  public unPlayer: Player;

  public playersWaiting;
  

  ngOnInit(): void {

    
    this.game = JSON.parse(localStorage.getItem('game'));
    this.unPlayer =JSON.parse(localStorage.getItem('player'));
    console.log(this.unPlayer.name);
    
    
    this._gameService.getGame(this.game._id).subscribe(
      (res) => {
        this.game = res['game'];
        
      },
      (error) => {
        
        this.router.navigateByUrl('/' + this.game._id + '/');
        
      });

    this._playerService.getPlayers(this.game._id).subscribe(
      (res) => {
        this.players = res['players'];
        this.playersWaiting = Array(8 - this.players.length).fill(0).map((x,i)=>i);
      }
    )

    
    
  }

  ready(){
    
  }

}
