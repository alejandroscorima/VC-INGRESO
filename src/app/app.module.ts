
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { DialogConfirm } from './lista-activos/lista-activos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { InicioComponent } from './inicio/inicio.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { DialogHistoryDetail, DialogLudops, HistoryComponent } from './history/history.component';
import { MatDialogModule } from '@angular/material/dialog';
import { GenerarActaComponent } from './generar-acta/generar-acta.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
//import { DialogRevisar } from './lista-activos/lista-activos.component';
import { DialogRevalidar} from './inicio/inicio.component';
import {MatCardModule} from '@angular/material/card';

import { ToastrModule } from 'ngx-toastr';

import { MatTableExporterModule } from 'mat-table-exporter';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DialogNewD, DialogNewR, DialogConfirm, ListasComponent } from './listas/listas.component';
import { DialogDatos, BirthdayComponent } from './birthday/birthday.component';

import {MatGridListModule} from '@angular/material/grid-list';
import { GoogleChartsModule } from 'angular-google-charts';
import { UploadComponent, DialogStatus } from './upload/upload.component';
import {MatTabsModule} from '@angular/material/tabs';




@NgModule({
    declarations: [
        AppComponent,
        ListasComponent,
        InicioComponent,
        HistoryComponent,
        GenerarActaComponent,
        BirthdayComponent,
        UploadComponent,
        //DialogRevisar,
        DialogRevalidar,
        DialogNewD,
        DialogNewR,
        DialogDatos,
        DialogConfirm,
        DialogHistoryDetail,
        DialogLudops,
        DialogStatus,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        HttpClientModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatTableExporterModule,
        MatGridListModule,
        GoogleChartsModule,
        MatTabsModule,
        ToastrModule.forRoot(), // ToastrModule added
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
    bootstrap: [AppComponent]
})
export class AppModule { }
