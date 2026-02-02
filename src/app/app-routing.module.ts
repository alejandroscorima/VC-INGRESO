
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { HistoryComponent } from './history/history.component';
import { ListasComponent } from './listas/listas.component';
import { BirthdayComponent } from './birthday/birthday.component';
import { UploadComponent } from './upload/upload.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { HousesComponent } from './houses/houses.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { MyHouseComponent } from './my-house/my-house.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "", component: InicioComponent, canActivate: [AuthGuard] },
  { path: "listas", component: ListasComponent, canActivate: [AuthGuard] },
  { path: "history", component: HistoryComponent, canActivate: [AuthGuard] },
  { path: "hb", component: BirthdayComponent, canActivate: [AuthGuard] },
  { path: "upload", component: UploadComponent, canActivate: [AuthGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
  { path: "users", component: UsersComponent, canActivate: [AuthGuard] },
  { path: "houses", component: HousesComponent, canActivate: [AuthGuard] },
  { path: "vehicles", component: VehiclesComponent, canActivate: [AuthGuard] },
  { path: "my-house", component: MyHouseComponent, canActivate: [AuthGuard] },
  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
