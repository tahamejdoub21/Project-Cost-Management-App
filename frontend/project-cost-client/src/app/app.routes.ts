import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ComponentsDemoComponent } from './demo/components-demo.component';

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
    path: '**',
    redirectTo: '',
  },
];
