
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { HistoryComponent } from './history/history.component';
import { BirthdayComponent } from './birthday/birthday.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { HousesComponent } from './houses/houses.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { MyHouseComponent } from './my-house/my-house.component';
import { PetsComponent } from './pets/pets.component';
import { CalendarComponent } from './calendar/calendar.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { PublicRegistrationComponent } from './public-registration/public-registration.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "registro", component: PublicRegistrationComponent },
  { path: "", component: InicioComponent, canActivate: [AuthGuard] },
  { path: "history", component: HistoryComponent, canActivate: [AuthGuard] },
  { path: "hb", component: BirthdayComponent, canActivate: [AuthGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
  { path: "users", component: UsersComponent, canActivate: [AuthGuard] },
  { path: "houses", component: HousesComponent, canActivate: [AuthGuard] },
  { path: "vehicles", component: VehiclesComponent, canActivate: [AuthGuard] },
  { path: "my-house", component: MyHouseComponent, canActivate: [AuthGuard] },
  { path: "pets", component: PetsComponent, canActivate: [AuthGuard] },
  { path: "calendar", component: CalendarComponent, canActivate: [AuthGuard] },
  { path: "scanner", component: QrScannerComponent, canActivate: [AuthGuard] },
  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
