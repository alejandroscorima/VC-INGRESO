import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationsService } from '../reservations.service';
import { Reservation, RESERVATION_STATUS, TimeSlot } from '../reservation';
import { AccessPoint } from '../accessPoint';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="calendar-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Calendario de Reservaciones</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="calendar-controls">
            <mat-form-field appearance="outline">
              <mat-label>Seleccionar Fecha</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="onDateChange($event)">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Área</mat-label>
              <mat-select [(ngModel)]="selectedArea" (selectionChange)="onAreaChange()">
                <mat-option [value]="null">Todas las áreas</mat-option>
                <mat-option *ngFor="let area of areas" [value]="area">
                  {{ area.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="calendar-view">
            <div class="date-header">
              <button mat-icon-button (click)="previousDay()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="date-title">{{ selectedDate | date:'fullDate' }}</span>
              <button mat-icon-button (click)="nextDay()">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <div class="reservations-list">
              <h3>Reservaciones del Día</h3>
              
              <mat-list *ngIf="dayReservations.length > 0; else noReservations">
                <mat-list-item *ngFor="let reservation of dayReservations">
                  <mat-icon matListItemIcon [ngClass]="getStatusClass(reservation.status)">
                    {{ getStatusIcon(reservation.status) }}
                  </mat-icon>
                  <div matListItemTitle>
                    {{ reservation.reservation_date | date:'shortTime' }} - 
                    {{ reservation.end_date | date:'shortTime' }}
                  </div>
                  <div matListItemLine>
                    {{ reservation.area_name }} | {{ reservation.num_guests }} invitados
                  </div>
                  <div matListItemMeta>
                    <mat-chip [color]="getStatusColor(reservation.status)" selected>
                      {{ reservation.status }}
                    </mat-chip>
                  </div>
                </mat-list-item>
              </mat-list>

              <ng-template #noReservations>
                <div class="no-reservations">
                  <mat-icon>event_busy</mat-icon>
                  <p>No hay reservaciones para este día</p>
                </div>
              </ng-template>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
    }
    .calendar-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .calendar-view {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
    }
    .date-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .date-title {
      font-size: 18px;
      font-weight: 500;
    }
    .reservations-list h3 {
      margin-bottom: 12px;
    }
    .no-reservations {
      text-align: center;
      padding: 32px;
      color: #666;
    }
    .no-reservations mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .status-confirmada { color: #4caf50; }
    .status-pendiente { color: #ff9800; }
    .status-cancelada { color: #f44336; }
    .status-completada { color: #2196f3; }
  `]
})
export class CalendarComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedArea: AccessPoint | null = null;
  areas: AccessPoint[] = [];
  dayReservations: Reservation[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private reservationsService: ReservationsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.loadReservations();
  }

  loadAreas(): void {
    this.reservationsService.getAreas().subscribe({
      next: (areas) => this.areas = areas,
      error: (err) => console.error('Error loading areas:', err)
    });
  }

  loadReservations(): void {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    let params: any = {
      start_date: dateStr,
      end_date: dateStr
    };
    
    if (this.selectedArea) {
      params.access_point_id = this.selectedArea.ap_id;
    }

    this.reservationsService.getByDateRange(dateStr, dateStr, this.selectedArea?.ap_id).subscribe({
      next: (reservations) => this.dayReservations = reservations,
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  onDateChange(event: any): void {
    this.loadReservations();
  }

  onAreaChange(): void {
    this.loadReservations();
  }

  previousDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.loadReservations();
  }

  nextDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.loadReservations();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMADA': return 'check_circle';
      case 'PENDIENTE': return 'hourglass_empty';
      case 'CANCELADA': return 'cancel';
      case 'COMPLETADA': return 'task_alt';
      default: return 'event';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMADA': return 'primary';
      case 'PENDIENTE': return 'warn';
      case 'CANCELADA': return 'accent';
      case 'COMPLETADA': return 'basic';
      default: return '';
    }
  }
}
