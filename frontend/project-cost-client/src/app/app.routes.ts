import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ComponentsDemoComponent } from './demo/components-demo.component';
import { AvatarExamplesComponent } from './pages/avatar-examples/avatar-examples.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'inputs',
    component: ComponentsDemoComponent,
  },
  {
    path: 'avatars',
    component: AvatarExamplesComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
