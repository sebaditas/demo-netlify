import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from "./pages/login/login.component";
import {FooterComponent} from "./layout/footer/footer.component";
import {HeaderComponent} from "./layout/header/header.component";
import {ProductComponent} from "./components/product/product.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {ReservationComponent} from "./pages/reservation/reservation.component";
import {ReservationsComponent} from "./pages/reservations/reservations.component";

// Your routing file should look like this
export const routes: Routes = [
  // A route to the home page (component)
  {
    path: '',
    component: HomeComponent,
  },
  { path: 'profile', component: ProfileComponent },

  // A route to the about us page (module)
  {
    path: 'about-us',
    loadChildren: () =>
      import('./modules/about-us/about-us.module').then((m) => m.AboutUsModule),
  },
  {
    path:'login', component:LoginComponent
  },
  {
    path:'home',
    component: HomeComponent,
    children: [
      {
        path:'home',
        component:HomeComponent
      }
    ]
  },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'reservation/:id', component: ReservationComponent },


];
