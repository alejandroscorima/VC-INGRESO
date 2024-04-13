
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

const routes: Routes = [
  { path: "", component: InicioComponent },
  { path: "listas", component: ListasComponent  },
  { path: "history", component: HistoryComponent },
  { path: "hb", component: BirthdayComponent },
  { path: "upload", component: UploadComponent },
  { path: "login", component: LoginComponent },
  { path: "settings", component: SettingsComponent },
  { path: "users", component: UsersComponent },
  { path: "houses", component: HousesComponent },
  { path: "vehicles", component: VehiclesComponent },
  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
