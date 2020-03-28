import {
  CreateJoinComponent,
  CreateLobbyComponent,
  CreateMainComponent,
  CreateTournamentComponent
} from "./containers";

export const routes = [
    {
        path:'',
        component: CreateMainComponent
    },
    {
        path:'lobby',
        component: CreateLobbyComponent
    }
]
