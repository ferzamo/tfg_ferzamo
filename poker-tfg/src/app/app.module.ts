import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
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

/* Angular materials */
import { SharedModule } from './shared/shared.module'

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
    SharedModule],
  providers: [],
  bootstrap: [ShellComponent]
})
export class AppModule {}
