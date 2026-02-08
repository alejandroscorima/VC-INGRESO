import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  PublicRegistrationService,
  PublicRegisterHouse,
  PublicRegisterOwner,
  PublicRegisterVehicle,
  PublicRegisterPet,
  PublicRegisterPayload,
  PublicRegisterResponseData,
  ReniecDniData,
  HouseFromApi
} from './public-registration.service';

const DOC_TYPES = ['DNI', 'CE', 'Otros'];
/** Estado civil (guardado en mayúsculas en BD, alineado con apidev/Nuevo Residente) */
const CIVIL_STATUS_OPTIONS = ['SOLTERO', 'CASADO', 'CONVIVIENTE', 'VIUDO', 'DIVORCIADO', 'OTRO'];
/** Tipos de vehículo: botones con ícono + texto; OTROS permite ingresar manualmente */
const VEHICLE_TYPE_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'AUTO', label: 'Auto', icon: '🚗' },
  { value: 'MOTOCICLETA', label: 'Motocicleta', icon: '🏍️' },
  { value: 'CAMIONETA', label: 'Camioneta', icon: '🛻' },
  { value: 'CAMION', label: 'Camion', icon: '🚚' },
  { value: 'MINIVAN', label: 'Minivan', icon: '🚌' },
  { value: 'MOTOTAXI', label: 'Mototaxi', icon: '🛵' },
  { value: 'MINI BUS', label: 'Minibus', icon: '🚌' },
  { value: 'FURGONETA', label: 'Furgoneta', icon: '🚐' },
  { value: 'OTRO', label: 'Otros', icon: '📝' }
];
/** Categoría de mascota (plan: PERRO, GATO, AVE, pequeño mamífero, Acuático, EXÓTICO, OTROS) */
const PET_CATEGORY_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'PERRO', label: 'Perro', icon: '🐕' },
  { value: 'GATO', label: 'Gato', icon: '🐈' },
  { value: 'AVE', label: 'Ave', icon: '🐦' },
  { value: 'PEQUEÑO MAMÍFERO', label: 'Pequeño mamífero', icon: '🐹' },
  { value: 'ACUÁTICO', label: 'Acuático', icon: '🐠' },
  { value: 'EXÓTICO', label: 'Exótico', icon: '🦎' },
  { value: 'OTRO', label: 'Otros', icon: '📝' }
];
/** Colores comunes vehículos (para círculos de selección rápida) */
const VEHICLE_COLOR_PRESETS = ['Blanco', 'Negro', 'Plata', 'Gris', 'Rojo', 'Azul', 'Verde', 'Beige', 'Otro'];
/** Colores comunes mascotas */
const PET_COLOR_PRESETS = ['Blanco', 'Negro', 'Café', 'Gris', 'Crema', 'Atigrado', 'Otro'];

/** Opciones para "Tipo de vivienda": botones con ícono + texto */
const HOUSE_TYPE_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'CASA', label: 'Casa', icon: '🏠' },
  { value: 'DEPARTAMENTO', label: 'Departamento', icon: '🏢' },
  { value: 'LOCAL COMERCIAL', label: 'Comercio', icon: '🏪' }
];

@Component({
  selector: 'app-public-registration',
  templateUrl: './public-registration.component.html',
  styleUrls: ['./public-registration.component.css']
})
export class PublicRegistrationComponent implements OnInit {
  step = 1;
  maxStep = 5;
  docTypes = DOC_TYPES;
  civilStatusOptions = CIVIL_STATUS_OPTIONS;
  vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  petCategoryOptions = PET_CATEGORY_OPTIONS;
  vehicleColorPresets = VEHICLE_COLOR_PRESETS;
  petColorPresets = PET_COLOR_PRESETS;
  houseTypeOptions = HOUSE_TYPE_OPTIONS;

  /** Casas cargadas desde la API (solo lo que hay en BD) */
  houses: HouseFromApi[] = [];
  loadingHouses = false;
  /** Tipo de vivienda elegido: filtra Manzana por house_type (CASA → A-N, P-V; DEPARTAMENTO → O; LOCAL COMERCIAL → LC) */
  selectedHouseType = '';
  /** Opciones para desplegables: manzana (según tipo), lote (según Mz), departamento (solo si tipo=DEPARTAMENTO, según Mz+Lt) */
  mzOptions: string[] = [];
  ltOptions: number[] = [];
  aptOptions: (string | null)[] = [];
  selectedMz = '';
  selectedLt: number | '' = '';
  selectedApt: string | null | '' = '';

  hasSecondOwner = false;
  wantVehicles = false;
  wantPets = false;

  mainForm: FormGroup;
  loadingDni = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private publicReg: PublicRegistrationService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.mainForm = this.buildForm();
  }

  ngOnInit(): void {
    this.loadHouses();
  }

  private loadHouses(): void {
    this.loadingHouses = true;
    this.publicReg.getHouses().subscribe({
      next: (res) => {
        this.loadingHouses = false;
        this.houses = res?.data ?? [];
        this.buildMzOptions();
      },
      error: () => {
        this.loadingHouses = false;
        this.toastr.error('No se pudo cargar la lista de domicilios.');
      }
    });
  }

  /** Manzanas filtradas por tipo de vivienda (desde BD: CASA→A-N,P-V; DEPARTAMENTO→O; LOCAL COMERCIAL→LC) */
  private buildMzOptions(): void {
    if (!this.selectedHouseType) {
      this.mzOptions = [];
      return;
    }
    const set = new Set(
      this.houses
        .filter(h => h.house_type === this.selectedHouseType)
        .map(h => h.block_house)
    );
    this.mzOptions = Array.from(set).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }

  /** Al cambiar tipo de vivienda: se filtran manzanas por house_type y se resetean Mz/Lt/Apt */
  onHouseTypeChange(): void {
    this.selectedMz = '';
    this.selectedLt = '';
    this.selectedApt = '';
    this.ltOptions = [];
    this.aptOptions = [];
    this.buildMzOptions();
    this.house.patchValue({
      house_type: this.selectedHouseType,
      block_house: '',
      lot: '',
      apartment: null
    });
  }

  /** Casas filtradas por la manzana elegida (block_house en BD) */
  get filteredByMz(): HouseFromApi[] {
    if (!this.selectedMz) return [];
    const mz = String(this.selectedMz).trim();
    return this.houses.filter(h => String(h.block_house).trim() === mz);
  }

  /** Casas filtradas por manzana + lote (lot en BD); comparación numérica para evitar "1" !== 1 */
  get filteredByMzLt(): HouseFromApi[] {
    if (this.selectedLt === '' || this.selectedLt === null || this.selectedLt === undefined) return [];
    const lotNum = Number(this.selectedLt);
    if (Number.isNaN(lotNum)) return [];
    return this.filteredByMz.filter(h => Number(h.lot) === lotNum);
  }

  onMzChange(): void {
    this.selectedLt = '';
    this.selectedApt = '';
    this.aptOptions = [];
    const byMz = this.filteredByMz;
    const lots = [...new Set(byMz.map(h => h.lot))].sort((a, b) => a - b);
    this.ltOptions = lots;
    this.clearHouseSelection();
  }

  onLtChange(): void {
    const byMzLt = this.filteredByMzLt;
    // Para DEPARTAMENTO: apartment tiene valor (101, 102, ...); para CASA/LC puede ser null
    const rawApts = byMzLt.map(h => h.apartment);
    const apts = [...new Set(rawApts)]
      .filter(a => a != null && a !== '')
      .map(a => (typeof a === 'number' ? String(a) : a) as string)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    // Si no hay apartamentos (CASA/LC), dejamos lista vacía; si hay uno solo, preseleccionar
    this.aptOptions = apts.length > 0 ? apts : [];
    this.selectedApt = apts.length === 1 ? apts[0] : '';
    this.applyHouseSelection();
  }

  onAptChange(): void {
    this.applyHouseSelection();
  }

  private clearHouseSelection(): void {
    this.house.patchValue({
      house_type: this.selectedHouseType,
      block_house: '',
      lot: '',
      apartment: null
    });
  }

  private applyHouseSelection(): void {
    const byMzLt = this.filteredByMzLt;
    if (byMzLt.length === 0) return;
    let chosen: HouseFromApi;
    const aptVal = this.selectedApt !== '' && this.selectedApt != null ? String(this.selectedApt) : null;
    if (this.aptOptions.length === 0) {
      chosen = byMzLt[0];
    } else if (aptVal) {
      chosen = byMzLt.find(h => String(h.apartment ?? '') === aptVal) ?? byMzLt[0];
    } else {
      chosen = byMzLt[0];
    }
    this.house.patchValue({
      house_type: chosen.house_type,
      block_house: chosen.block_house,
      lot: chosen.lot,
      apartment: chosen.apartment
    });
  }

  /** Formato lote para mostrar (ej. 1 → "01") */
  formatLot(lot: number): string {
    return lot < 10 ? `0${lot}` : String(lot);
  }

  get house(): FormGroup {
    return this.mainForm.get('house') as FormGroup;
  }

  get owners(): FormArray {
    return this.mainForm.get('owners') as FormArray;
  }

  get owner1(): FormGroup {
    return this.owners.at(0) as FormGroup;
  }

  get owner2(): FormGroup {
    return this.owners.at(1) as FormGroup;
  }

  get vehicles(): FormArray {
    return this.mainForm.get('vehicles') as FormArray;
  }

  get pets(): FormArray {
    return this.mainForm.get('pets') as FormArray;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      house: this.fb.group({
        house_type: ['CASA', Validators.required],
        block_house: ['', Validators.required],
        lot: ['', Validators.required],
        apartment: [null as string | null]
      }),
      owners: this.fb.array([
        this.buildOwnerGroup(),
        this.buildOwnerGroup()
      ]),
      vehicles: this.fb.array([]),
      pets: this.fb.array([])
    });
  }

  private buildOwnerGroup(): FormGroup {
    return this.fb.group({
      type_doc: ['DNI', Validators.required],
      doc_number: ['', [Validators.required, Validators.minLength(8)]],
      first_name: ['', Validators.required],
      paternal_surname: ['', Validators.required],
      maternal_surname: [''],
      cel_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [null as string | null],
      birth_date: [null as string | null],
      address: [null as string | null],
      district: [null as string | null],
      province: [null as string | null],
      region: [null as string | null],
      civil_status: [null as string | null]
    });
  }

  private buildVehicleGroup(): FormGroup {
    return this.fb.group({
      type_vehicle: ['AUTO', Validators.required],
      type_vehicle_other: [''], // cuando type_vehicle === 'OTRO'
      license_plate: ['', Validators.required],
      brand: ['', Validators.required],
      model: [''],
      color: ['', Validators.required],
      photo_url: [null as string | null]
    });
  }

  private buildPetGroup(): FormGroup {
    return this.fb.group({
      species: ['PERRO', Validators.required],
      species_other: [''], // cuando species === 'OTRO'
      name: ['', Validators.required],
      breed: [''],
      color: ['', Validators.required],
      age_years: [null as number | null],
      photo_url: [null as string | null]
    });
  }

  setVehicleColor(vehicleIndex: number, color: string): void {
    const g = this.vehicles.at(vehicleIndex) as FormGroup;
    g.get('color')?.setValue(color);
  }

  setPetColor(petIndex: number, color: string): void {
    const g = this.pets.at(petIndex) as FormGroup;
    g.get('color')?.setValue(color);
  }

  /** Hex para círculos de color vehículo (preset por nombre) */
  getVehicleColorHex(name: string): string {
    const map: Record<string, string> = {
      'Blanco': '#fff', 'Negro': '#1a1a1a', 'Plata': '#c0c0c0', 'Gris': '#808080',
      'Rojo': '#c0392b', 'Azul': '#2980b9', 'Verde': '#27ae60', 'Beige': '#d4b896', 'Otro': '#ddd'
    };
    return map[name] ?? '#ddd';
  }

  /** Hex para círculos de color mascota */
  getPetColorHex(name: string): string {
    const map: Record<string, string> = {
      'Blanco': '#fff', 'Negro': '#1a1a1a', 'Café': '#8b4513', 'Gris': '#808080',
      'Crema': '#f5e6d3', 'Atigrado': '#c4a574', 'Otro': '#ddd'
    };
    return map[name] ?? '#ddd';
  }

  addVehicle(): void {
    this.vehicles.push(this.buildVehicleGroup());
  }

  removeVehicle(i: number): void {
    this.vehicles.removeAt(i);
  }

  addPet(): void {
    this.pets.push(this.buildPetGroup());
  }

  removePet(i: number): void {
    this.pets.removeAt(i);
  }

  /** Consulta DNI y rellena el owner en el índice indicado (0 o 1). */
  fetchDni(ownerIndex: number): void {
    const group = this.owners.at(ownerIndex) as FormGroup;
    const doc = group.get('doc_number')?.value?.trim();
    if (!doc || doc.length < 8) {
      this.toastr.warning('Ingrese un número de DNI válido (mín. 8 dígitos)');
      return;
    }
    if (group.get('type_doc')?.value !== 'DNI') {
      this.toastr.info('La consulta automática solo está disponible para DNI');
      return;
    }
    this.loadingDni = true;
    this.publicReg.getDniData(doc).subscribe({
      next: (data: ReniecDniData | null) => {
        this.loadingDni = false;
        if (data) {
          const sexToGender = (s: string) => (s === 'M' || s === 'F' ? s : (s === 'MASCULINO' ? 'M' : s === 'FEMENINO' ? 'F' : s || null));
          const birth = data.fecha_nacimiento ? this.normalizeBirthDate(data.fecha_nacimiento) : null;
          const civil = ((data as { estado_civil?: string }).estado_civil || '').toString().trim().toUpperCase();
          group.patchValue({
            doc_number: data.numero || doc,
            first_name: this.normalizeName(data.nombres),
            paternal_surname: this.normalizeName(data.apellido_paterno),
            maternal_surname: this.normalizeName(data.apellido_materno || ''),
            gender: sexToGender((data.sexo || '').trim()),
            birth_date: birth,
            address: (data.direccion_completa || data.direccion || '').trim() || null,
            district: (data.distrito || '').trim() || null,
            province: (data.provincia || '').trim() || null,
            region: (data.departamento || '').trim() || null,
            civil_status: civil || null
          });
          this.toastr.success('Datos obtenidos. Revise y complete si es necesario.');
        } else {
          this.toastr.warning('No se encontraron datos para este DNI');
        }
      },
      error: () => {
        this.loadingDni = false;
        this.toastr.error('Error al consultar DNI. Verifique conexión o intente más tarde.');
      }
    });
  }

  private normalizeName(s: string): string {
    if (!s) return '';
    return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  /** Convierte fecha RENIEC (DD/MM/YYYY o YYYY-MM-DD) a YYYY-MM-DD para persons.birth_date */
  private normalizeBirthDate(value: string): string | null {
    if (!value || typeof value !== 'string') return null;
    const t = value.trim();
    const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(t);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    return null;
  }

  nextStep(): void {
    if (this.step < this.maxStep) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  goToStep(s: number): void {
    this.step = s;
  }

  /** Valida solo la sección actual antes de avanzar. */
  canProceedSection1(): boolean {
    return this.house.valid && this.owner1.valid;
  }

  canProceedSection2(): boolean {
    if (!this.hasSecondOwner) return true;
    return this.owner2.valid;
  }

  buildPayload(): PublicRegisterPayload {
    const houseVal = this.house.value;
    const lotNum = houseVal.lot == null || houseVal.lot === '' ? null : Number(houseVal.lot);
    const house: PublicRegisterHouse = {
      house_type: houseVal.house_type,
      block_house: String(houseVal.block_house).trim(),
      lot: lotNum,
      apartment: houseVal.apartment == null || houseVal.apartment === '' ? null : String(houseVal.apartment).trim()
    };

    const owners: PublicRegisterOwner[] = [];
    owners.push(this.ownerToPayload(this.owner1));
    if (this.hasSecondOwner) owners.push(this.ownerToPayload(this.owner2));

    const vehicles: PublicRegisterVehicle[] = this.wantVehicles
      ? this.vehicles.controls.map(c => this.vehicleToPayload(c as FormGroup))
      : [];
    const pets: PublicRegisterPet[] = this.wantPets
      ? this.pets.controls.map(c => this.petToPayload(c as FormGroup))
      : [];

    return { house, owners, vehicles, pets };
  }

  private ownerToPayload(g: FormGroup): PublicRegisterOwner {
    const v = g.value;
    const o: PublicRegisterOwner = {
      type_doc: v.type_doc || 'DNI',
      doc_number: String(v.doc_number).trim(),
      first_name: String(v.first_name).trim(),
      paternal_surname: String(v.paternal_surname).trim()
    };
    if (v.maternal_surname?.trim()) o.maternal_surname = v.maternal_surname.trim();
    if (v.cel_number?.trim()) o.cel_number = v.cel_number.trim();
    if (v.email?.trim()) o.email = v.email.trim();
    if (v.gender?.trim()) o.gender = v.gender.trim();
    if (v.birth_date) o.birth_date = v.birth_date;
    if (v.address?.trim()) o.address = v.address.trim();
    if (v.district?.trim()) o.district = v.district.trim();
    if (v.province?.trim()) o.province = v.province.trim();
    if (v.region?.trim()) o.region = v.region.trim();
    if (v.civil_status?.trim()) o.civil_status = v.civil_status.trim();
    return o;
  }

  private vehicleToPayload(g: FormGroup): PublicRegisterVehicle {
    const v = g.value;
    const typeVehicle = v.type_vehicle === 'OTRO' && v.type_vehicle_other?.trim()
      ? v.type_vehicle_other.trim() : (v.type_vehicle || undefined);
    return {
      license_plate: String(v.license_plate).trim(),
      type_vehicle: typeVehicle,
      brand: v.brand?.trim() || undefined,
      model: v.model?.trim() || undefined,
      color: v.color?.trim() || undefined,
      photo_url: v.photo_url?.trim() || null
    };
  }

  private petToPayload(g: FormGroup): PublicRegisterPet {
    const v = g.value;
    let species = (v.species || '').toString().trim().toUpperCase();
    if (species === 'OTRO' && v.species_other?.trim()) {
      species = v.species_other.trim().toUpperCase();
    }
    const allowed = ['PERRO', 'GATO', 'AVE', 'PEQUEÑO MAMÍFERO', 'ACUÁTICO', 'EXÓTICO', 'OTRO'];
    const finalSpecies = allowed.includes(species) ? species : (species || 'OTRO');
    return {
      species: finalSpecies,
      name: String(v.name).trim(),
      breed: v.breed?.trim() || undefined,
      color: v.color?.trim() || undefined,
      age_years: v.age_years == null || v.age_years === '' ? null : Number(v.age_years),
      photo_url: v.photo_url?.trim() || null
    };
  }

  submit(): void {
    if (!this.canProceedSection1() || (this.hasSecondOwner && !this.canProceedSection2())) {
      this.toastr.error('Complete los datos obligatorios de propietarios y vivienda.');
      return;
    }
    if (this.wantVehicles && this.vehicles.length === 0) {
      this.toastr.error('Agregue al menos un vehículo o seleccione "No" en registrar vehículos.');
      return;
    }
    if (this.wantPets && this.pets.length === 0) {
      this.toastr.error('Agregue al menos una mascota o seleccione "No" en registrar mascotas.');
      return;
    }
    const payload = this.buildPayload();
    this.submitting = true;
    this.publicReg.register(payload).subscribe({
      next: (res: { data?: PublicRegisterResponseData }) => {
        this.submitting = false;
        const created = res?.data?.created_users;
        if (created?.length) {
          const first = created[0];
          this.toastr.success(
            `Registro completado. Usuario: ${first.username_system}, Contraseña temporal: ${first.temporary_password}. Debe cambiar la contraseña en el primer acceso.`,
            undefined,
            { timeOut: 12000 }
          );
          this.router.navigate(['/login'], { queryParams: { username: first.username_system } });
        } else {
          this.toastr.success('Registro completado.');
          this.router.navigate(['/login']);
        }
      },
      error: err => {
        this.submitting = false;
        this.toastr.error(err?.error?.error || err?.message || 'Error al enviar el registro');
      }
    });
  }
}
