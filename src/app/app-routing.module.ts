
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { BirthdayComponent } from './birthday/birthday.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { HousesComponent } from './houses/houses.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { MyHouseComponent } from './my-house/my-house.component';
import { PetsComponent } from './pets/pets.component';
import { AccessPointsComponent } from './access-points/access-points.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { PublicRegistrationComponent } from './public-registration/public-registration.component';
import { LandingComponent } from './landing/landing.component';
import { CodigoQrPageComponent } from './qr/codigo-qr-page.component';
import { AuthGuard } from './auth.guard';
import { MyHouseGuard } from './my-house.guard';
import { CodigoQrGuard } from './qr/codigo-qr.guard';
import { ReservationsGuard } from './reservations.guard';
import { AccessPointsGuard } from './access-points.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "landing", component: LandingComponent },
  { path: "registro", component: PublicRegistrationComponent },
  { path: "", component: DashboardComponent, canActivate: [AuthGuard] },
  { path: "history", component: HistoryComponent, canActivate: [AuthGuard] },
  { path: "hb", component: BirthdayComponent, canActivate: [AuthGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
  { path: "users", component: UsersComponent, canActivate: [AuthGuard] },
  { path: "houses", component: HousesComponent, canActivate: [AuthGuard] },
  { path: "vehicles", component: VehiclesComponent, canActivate: [AuthGuard] },
  { path: "my-house", component: MyHouseComponent, canActivate: [AuthGuard, MyHouseGuard] },
  { path: "pets", component: PetsComponent, canActivate: [AuthGuard] },
  { path: "access-points", component: AccessPointsComponent, canActivate: [AuthGuard, AccessPointsGuard] },
  { path: "reservations", component: ReservationsComponent, canActivate: [AuthGuard, ReservationsGuard] },
  { path: "calendar", redirectTo: "reservations", pathMatch: "full" },
  { path: "codigo-qr", component: CodigoQrPageComponent, canActivate: [AuthGuard, CodigoQrGuard] },
  { path: "scanner", redirectTo: "codigo-qr", pathMatch: "full" },
  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
