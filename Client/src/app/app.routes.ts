import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
  { path: '', component: MainComponent, children: [
      { path: '', loadChildren: () => import('./main/main-routing.module').then(m => m.MainRoutingModule) }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
