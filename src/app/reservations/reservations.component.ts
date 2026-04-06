import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationsService } from '../reservations.service';
import { Reservation } from '../reservation';
import { AccessPoint } from '../accessPoint';
import { House } from '../house';
import { AuthService } from '../auth.service';
import { EntranceService } from '../entrance.service';
import { ToastrService } from 'ngx-toastr';

interface MonthCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  dots: string[];
  extraCount: number;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnInit {
  viewMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  monthReservations: Reservation[] = [];
  areas: AccessPoint[] = [];
  houses: House[] = [];
  loading = false;
  saving = false;

  modalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  editingId: number | null = null;

  formAccessPointId: number | null = null;
  formHouseId: number | null = null;
  formStart = '';
  formEnd = '';
  formGuests = 1;
  formObservation = '';
  formPhone = '';
  formStatus = 'PENDIENTE';

  /** Filtros tabla de solicitudes (misma lógica que Usuarios / Vehículos) */
  tableSearch = '';
  selectedBlock = '';
  selectedLot = '';

  /** Vista calendario + tabla: 'ALL' o id de access_point */
  calendarAreaFilter: 'ALL' | number = 'ALL';

  readonly maxEventHours = 8;
  readonly weekDayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  private readonly monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  constructor(
    private reservationsService: ReservationsService,
    private auth: AuthService,
    private entrance: EntranceService,
    private toastr: ToastrService
  ) {}

  get isAdmin(): boolean {
    return this.auth.isAdministratorRole();
  }

  get isNeighbor(): boolean {
    return this.auth.isNeighbor();
  }

  /** Residente con casa en sesión: puede enviar solicitudes. */
  get canRequest(): boolean {
    if (this.isAdmin) {
      return true;
    }
    if (!this.isNeighbor) {
      return false;
    }
    const u = this.auth.getUser();
    return Number((u as { house_id?: number })?.house_id ?? 0) > 0;
  }

  get monthTitle(): string {
    return `${this.monthNames[this.viewMonth.getMonth()]} ${this.viewMonth.getFullYear()}`;
  }

  /** Reservas del mes acotadas al área elegida (calendario y tabla). */
  get reservationsForMonthView(): Reservation[] {
    if (this.calendarAreaFilter === 'ALL') {
      return this.monthReservations;
    }
    const apId = this.calendarAreaFilter as number;
    return this.monthReservations.filter((r) => Number(r.access_point_id) === apId);
  }

  get tableRows(): Reservation[] {
    const sorted = [...this.reservationsForMonthView].sort(
      (a, b) =>
        new Date(b.reservation_date).getTime() - new Date(a.reservation_date).getTime()
    );
    return sorted.filter((r) => this.reservationMatchesFilters(r));
  }

  clearTableFilters(): void {
    this.tableSearch = '';
    this.selectedBlock = '';
    this.selectedLot = '';
  }

  /** Manzanas distintas de todas las viviendas (como Users). */
  get uniqueBlocks(): string[] {
    return [...new Set(this.houses.map((h) => h.block_house.toString()))].sort();
  }

  /** Lotes: si hay manzana elegida, solo de esa manzana; si no, todos los lotes (como Users). */
  get uniqueLots(): string[] {
    const filtered = this.selectedBlock
      ? this.houses.filter((h) => h.block_house.toString() === this.selectedBlock)
      : this.houses;
    return [...new Set(filtered.map((h) => h.lot.toString()))].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }

  onReservationBlockFilterChange(): void {
    this.selectedLot = '';
  }

  private reservationMatchesFilters(r: Reservation): boolean {
    const hid = r.house_id;
    const house = hid != null ? this.houses.find((h) => h.house_id === hid) : undefined;

    const blockVal = (house?.block_house ?? '').toString();
    const lotVal = house?.lot != null ? String(house.lot) : '';

    if (this.selectedBlock && blockVal !== this.selectedBlock) {
      return false;
    }
    if (this.selectedLot && lotVal !== this.selectedLot) {
      return false;
    }

    const q = this.tableSearch.trim().toLowerCase();
    if (!q) {
      return true;
    }

    const parts: string[] = [
      r.area_name ?? '',
      r.status ?? '',
      r.observation ?? '',
      r.contact_phone ?? '',
      String(r.house_id ?? ''),
      this.houseDisplay(r),
      r.reservation_date ?? '',
      r.end_date ?? '',
    ];
    const haystack = parts.join(' ').toLowerCase();
    return haystack.includes(q);
  }

  get monthCells(): MonthCell[] {
    const y = this.viewMonth.getFullYear();
    const m = this.viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0).getDate();
    const mondayFirst = (first.getDay() + 6) % 7;
    const cells: MonthCell[] = [];

    for (let i = 0; i < mondayFirst; i++) {
      const day = new Date(y, m, 1 - mondayFirst + i);
      cells.push(this.makeCell(day, false));
    }
    for (let d = 1; d <= lastDay; d++) {
      cells.push(this.makeCell(new Date(y, m, d), true));
    }
    while (cells.length % 7 !== 0) {
      const prev = cells[cells.length - 1].date;
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      cells.push(this.makeCell(next, false));
    }
    return cells;
  }

  private makeCell(date: Date, inMonth: boolean): MonthCell {
    const list = this.reservationsForDay(date)
      .sort((a, b) => new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime());
    const maxDots = 3;
    const dots = list.slice(0, maxDots).map((r) => this.statusDotClass(r.status));
    const extraCount = Math.max(0, list.length - maxDots);
    return {
      date,
      inMonth,
      isToday: this.isSameDay(date, new Date()),
      dots,
      extraCount,
    };
  }

  ngOnInit(): void {
    this.loadAreas();
    this.loadHouses();
    this.loadMonth();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) {
      this.closeModal();
    }
  }

  trackCell(_i: number, cell: MonthCell): string {
    return `${cell.date.getTime()}-${cell.inMonth}`;
  }

  dayCellClasses(cell: MonthCell): Record<string, boolean> {
    return {
      'opacity-40': !cell.inMonth,
      'ring-2': cell.isToday,
      'ring-teal-500': cell.isToday,
      'bg-teal-50': cell.isToday && cell.inMonth,
      'dark:bg-teal-900': cell.isToday && cell.inMonth,
    };
  }

  goToday(): void {
    const n = new Date();
    this.viewMonth = new Date(n.getFullYear(), n.getMonth(), 1);
    this.loadMonth();
  }

  prevMonth(): void {
    const d = new Date(this.viewMonth);
    d.setMonth(d.getMonth() - 1);
    this.viewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    this.loadMonth();
  }

  nextMonth(): void {
    const d = new Date(this.viewMonth);
    d.setMonth(d.getMonth() + 1);
    this.viewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    this.loadMonth();
  }

  loadMonth(): void {
    const y = this.viewMonth.getFullYear();
    const mo = this.viewMonth.getMonth();
    const start = this.formatYmd(new Date(y, mo, 1));
    const end = this.formatYmd(new Date(y, mo + 1, 0));
    this.loading = true;
    this.reservationsService.getReservationsInRange(start, end, 250).subscribe({
      next: (rows) => {
        this.monthReservations = rows;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('No se pudieron cargar las reservas del mes.');
      },
    });
  }

  loadAreas(): void {
    this.reservationsService.getAreas().subscribe({
      next: (areas) => (this.areas = areas),
      error: () => this.toastr.error('No se pudieron cargar las áreas.'),
    });
  }

  loadHouses(): void {
    this.entrance.getAllHouses().subscribe({
      next: (res: unknown) => {
        const list = Array.isArray(res) ? res : ((res as { data?: House[] })?.data ?? []);
        this.houses = list as House[];
      },
      error: () => {},
    });
  }

  onDayClick(cell: MonthCell): void {
    if (!cell.inMonth) {
      this.viewMonth = new Date(cell.date.getFullYear(), cell.date.getMonth(), 1);
      this.loadMonth();
      return;
    }
    if (!this.isAdmin && !this.canRequest) {
      this.toastr.info('Con tu usuario no puedes registrar nuevas solicitudes.');
      return;
    }
    this.openCreate(cell.date);
  }

  openCreate(day: Date): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.formObservation = '';
    this.formPhone = '';
    this.formGuests = 1;
    this.formStatus = 'PENDIENTE';
    if (this.calendarAreaFilter !== 'ALL') {
      this.formAccessPointId = this.calendarAreaFilter as number;
    } else {
      this.formAccessPointId = this.areas.length ? this.areaId(this.areas[0]) : null;
    }

    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(17, 0, 0, 0);
    this.formStart = this.toDatetimeLocalValue(start);
    this.formEnd = this.toDatetimeLocalValue(end);

    const u = this.auth.getUser();
    if (this.isAdmin) {
      this.formHouseId = this.houses.length ? this.houses[0].house_id ?? null : null;
    } else {
      this.formHouseId = Number((u as { house_id?: number })?.house_id ?? 0) || null;
    }

    this.modalOpen = true;
  }

  openEdit(r: Reservation): void {
    if (!r.id) {
      return;
    }
    this.modalMode = 'edit';
    this.editingId = r.id;
    this.formAccessPointId = r.access_point_id;
    this.formHouseId = r.house_id;
    this.formStart = this.toDatetimeLocalValue(this.parseApiDate(r.reservation_date));
    this.formEnd = r.end_date ? this.toDatetimeLocalValue(this.parseApiDate(r.end_date)) : '';
    this.formGuests = r.num_guests ?? 1;
    this.formObservation = r.observation ?? '';
    this.formPhone = r.contact_phone ?? '';
    this.formStatus = r.status;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.saving = false;
  }

  submitModal(): void {
    if (this.saving) {
      return;
    }
    if (this.formAccessPointId == null || !this.formStart || !this.formEnd) {
      this.toastr.warning('Completa área, inicio y fin.');
      return;
    }
    const start = new Date(this.formStart);
    const end = new Date(this.formEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.toastr.warning('Fechas no válidas.');
      return;
    }
    if (end <= start) {
      this.toastr.warning('La hora de fin debe ser posterior al inicio.');
      return;
    }
    const hours = (end.getTime() - start.getTime()) / 3600000;
    if (hours - this.maxEventHours > 1e-6) {
      this.toastr.warning(`La duración máxima es ${this.maxEventHours} horas.`);
      return;
    }

    const u = this.auth.getUser();
    const houseId = this.isAdmin
      ? this.formHouseId
      : this.formHouseId ?? Number((u as { house_id?: number })?.house_id ?? 0);
    if (!houseId) {
      this.toastr.warning('Falta la casa.');
      return;
    }

    const payload: Partial<Reservation> = {
      access_point_id: this.formAccessPointId,
      house_id: houseId,
      reservation_date: this.toMysqlDateTime(start),
      end_date: this.toMysqlDateTime(end),
      num_guests: this.formGuests,
      observation: this.formObservation?.trim() || undefined,
      contact_phone: this.formPhone?.trim() || undefined,
    };
    const pid = (u as { person_id?: number })?.person_id;
    if (pid && pid > 0) {
      payload.person_id = pid;
    }

    if (this.isAdmin && this.modalMode === 'edit' && this.formStatus) {
      payload.status = this.formStatus as Reservation['status'];
    }

    this.saving = true;
    if (this.modalMode === 'edit' && this.editingId != null) {
      this.reservationsService.updateReservation(this.editingId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success('Reserva actualizada.');
          this.closeModal();
          this.loadMonth();
        },
        error: (err) => {
          this.saving = false;
          this.toastr.error(err?.error?.error || 'No se pudo guardar.');
        },
      });
    } else {
      this.reservationsService.createReservation(payload).subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success('Solicitud enviada.');
          this.closeModal();
          this.loadMonth();
        },
        error: (err) => {
          this.saving = false;
          this.toastr.error(err?.error?.error || 'No se pudo enviar la solicitud.');
        },
      });
    }
  }

  setStatus(r: Reservation, status: Reservation['status']): void {
    if (!r.id) {
      return;
    }
    this.reservationsService.updateStatus(r.id, status).subscribe({
      next: () => {
        this.toastr.success('Estado actualizado.');
        this.loadMonth();
      },
      error: (err) => this.toastr.error(err?.error?.error || 'No se pudo cambiar el estado.'),
    });
  }

  cancelReservation(r: Reservation): void {
    if (!confirm('¿Cancelar esta reservación?')) {
      return;
    }
    this.setStatus(r, 'CANCELADA');
  }

  canEdit(r: Reservation): boolean {
    if (this.isAdmin) {
      return true;
    }
    if (!this.isNeighbor) {
      return false;
    }
    return r.status === 'PENDIENTE';
  }

  /**
   * Vecino: cancelar por domicilio (misma casa), no solo quien creó la solicitud.
   */
  canCancelAsNeighbor(r: Reservation): boolean {
    if (this.isAdmin || !this.isNeighbor) {
      return false;
    }
    return r.status === 'PENDIENTE' || r.status === 'CONFIRMADA';
  }

  /**
   * Administrador: solo si la reserva es del mismo domicilio que el del usuario en sesión.
   */
  canCancelAsAdmin(r: Reservation): boolean {
    if (!this.isAdmin) {
      return false;
    }
    const hid = this.getSessionHouseId();
    if (hid <= 0 || r.house_id == null) {
      return false;
    }
    return (
      Number(r.house_id) === hid &&
      (r.status === 'PENDIENTE' || r.status === 'CONFIRMADA')
    );
  }

  private getSessionHouseId(): number {
    const u = this.auth.getUser() as { house_id?: number } | null;
    return Number(u?.house_id ?? 0);
  }

  /**
   * Misma lógica visual que usuarios/vehículos (tablas): MZ / LT / DPTO si aplica.
   * Solo en este componente, sin dependencias extra.
   */
  private domicilioDesdeCasa(h: House): string {
    const mz = (h.block_house ?? '-').toString().toUpperCase();
    const lt = (h.lot ?? '-').toString().toUpperCase();
    const apt = (h.apartment ?? '').toString().trim();
    let out = `MZ:${mz} LT:${lt}`;
    if (apt !== '') {
      out += ` DPTO:${apt.toUpperCase()}`;
    }
    return out;
  }

  houseDisplay(r: Reservation): string {
    const h = this.houses.find((x) => x.house_id === r.house_id);
    if (h) {
      return this.domicilioDesdeCasa(h);
    }
    return r.house_id != null && Number(r.house_id) > 0 ? `#${r.house_id}` : '—';
  }

  houseOptionLabel(h: House): string {
    return this.domicilioDesdeCasa(h);
  }

  areaId(a: AccessPoint): number | null {
    const v = (a as { ap_id?: number; id?: number }).ap_id ?? (a as { id?: number }).id;
    return v != null ? Number(v) : null;
  }

  areaName(a: AccessPoint): string {
    return (a as { name?: string }).name || 'Área';
  }

  /** Etiqueta en selector: nombre + tipo. */
  areaOptionLabel(a: AccessPoint): string {
    const name = this.areaName(a);
    const t = String((a as { type?: string }).type ?? '')
      .trim()
      .toUpperCase();
    const map: Record<string, string> = {
      ENTRADA: 'Entrada',
      AREA_COMUN: 'Área común',
      AREA_LIMITADA: 'Área limitada',
    };
    const kind = t ? map[t] || t : 'Área';
    return `${name} (${kind})`;
  }

  /** Opciones válidas para el select (evita ids nulos). */
  get areasSelectable(): AccessPoint[] {
    return this.areas.filter((a) => this.areaId(a) != null);
  }

  statusBadgeClass(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMADA':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200';
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      case 'RECHAZADA':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200';
      case 'COMPLETADA':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  private statusDotClass(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMADA':
        return 'bg-emerald-500';
      case 'PENDIENTE':
        return 'bg-amber-500';
      case 'CANCELADA':
        return 'bg-red-400';
      case 'RECHAZADA':
        return 'bg-violet-500';
      case 'COMPLETADA':
        return 'bg-sky-500';
      default:
        return 'bg-gray-400';
    }
  }

  private reservationsForDay(d: Date): Reservation[] {
    const key = this.formatYmd(d);
    return this.reservationsForMonthView.filter((r) => {
      const rd = (r.reservation_date || '').substring(0, 10);
      return rd === key;
    });
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  formatYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toMysqlDateTime(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  }

  private toDatetimeLocalValue(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  private parseApiDate(s: string): Date {
    const normalized = s.trim().replace(' ', 'T');
    let d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      return d;
    }
    d = new Date(s);
    return d;
  }

}
