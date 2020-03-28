import {Routes} from '@angular/router';

export const ROUTES: Routes = [
    {
        path: '',
        loadChildren: './modules/+create/creade.module#CreateModule',
    }
]