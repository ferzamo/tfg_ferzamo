import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CreateJoinComponent,
  CreateLobbyComponent,
  CreateMainComponent,
  CreateTournamentComponent
} from "./containers";

import {RouterModule} from '@angular/router';
import {} from './'

@NgModule({
  declarations: [
    CreateMainComponent,
    CreateJoinComponent,
    CreateTournamentComponent,
    CreateLobbyComponent
  ],
  imports: [CommonModule]
})
export class CreateModule {}
