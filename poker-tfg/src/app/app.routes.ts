import {Routes} from '@angular/router';
import {
    CreateComponent,
    GameComponent,
    JoinComponent,
    LobbyComponent,
    MainComponent
  } from "./components";

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'join',
        component: JoinComponent
    },
    {
        path: 'create',
        component: CreateComponent
    },
    {
        path: ':gameId/lobby',
        component: LobbyComponent
    },
    {
        path: 'game',
        component: GameComponent
    },
    {
        path: '**',
        component: MainComponent
    }
]