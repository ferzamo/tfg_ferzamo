import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {MatSliderModule} from '@angular/material/slider';
import {HttpClientModule} from '@angular/common/http'

import {
  CreateComponent,
  GameComponent,
  JoinComponent,
  LobbyComponent,
  ShellComponent,
  MainComponent
} from "./components";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { FormsModule } from '@angular/forms';

/* Angular materials */
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FlipModule } from 'ngx-flip';



@NgModule({
  declarations: [
    CreateComponent,
    GameComponent,
    JoinComponent,
    LobbyComponent,
    ShellComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes), 
    SharedModule,
    MatSliderModule,
    BrowserAnimationsModule,
    FormsModule,
    FlipModule,
    HttpClientModule],
  providers: [],
  bootstrap: [ShellComponent]
})
export class AppModule {}
