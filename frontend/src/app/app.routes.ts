import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Calendar } from './features/calendar/calendar/calendar';
import { CalendarLinked } from './features/calendar/calendar-linked/calendar-linked';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard], title: 'Home · Orbit' },
  { path: 'login', component: Login, canActivate: [guestGuard], title: 'Sign in · Orbit' },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
    title: 'Create account · Orbit',
  },
  { path: 'calendar', component: Calendar, canActivate: [authGuard], title: 'Calendar · Orbit' },
  {
    path: 'calendar-linked',
    component: CalendarLinked,
    canActivate: [authGuard],
    title: 'Google Calendar · Orbit',
  },
  { path: '**', redirectTo: '' },
];
