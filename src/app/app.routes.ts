import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },

    { path: 'home', loadComponent: () => import('./home/home').then(m => m.Home) },
    { path: 'about', loadComponent: () => import('./about/about').then(m => m.About) },
    { path: 'work', loadComponent: () => import('./work/work').then(m => m.Work) },

    { path: '**', redirectTo: 'home' },
]
