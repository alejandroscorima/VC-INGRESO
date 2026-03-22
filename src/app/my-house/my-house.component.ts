import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { ApiService } from '../api.service';
import { ExternalVehicle } from '../externalVehicle';
import { Vehicle } from '../vehicle';
import { ToastrService } from 'ngx-toastr';
import { PetsService } from '../pets.service';
import { Pet } from '../pet';
import { PublicRegistrationService } from '../public-registration/public-registration.service';


@Component({
  selector: 'app-my-house',
  templateUrl: './my-house.component.html',
  styleUrls: ['./my-house.component.css']
})
export class MyHouseComponent implements OnInit, AfterViewInit {

  document = document;

  users: User[] = [];
  userToAdd: User = User.empty();
  userToEdit: User = User.empty();

  houses: House[] = [];
  houseToAdd: House = new House('',0,null,'',0);
  houseToEdit: House = new House('',0,null,'',0);

  myFamily: User[] = [];
  myResidents: User[] = [];
  myTenants: User[] = [];
  myVisits: User[] = [];
  myVehicles: Vehicle[] = [];
  myPets: Pet[] = [];

  showViewPhotoDialog = false;
  viewPhotoUrl: string | null = null;
  viewPhotoTitle = '';

  user_id;
  userOnSes: User = User.empty();

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['F', 'M'];
  roles: string[] = ['USUARIO','ADMINISTRADOR','OPERARIO'];
  status_validated: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','RESIDENTE','INQUILINO'];
  categories_visits: string[] = ['INVITADO'];
  types: string[] = ['MOTOCICLETA','MOTOTAXI','AUTOMOVIL','CAMIONETA','MINIVAN','BICICLETA','FURGONETA'];
  temp_visit_type:string[]=['DELIVERY','COLECTIVO','TAXI'];
  
  // Colores para vehículos
  vehicleColors: string[] = ['Blanco', 'Negro', 'Plata', 'Gris', 'Rojo', 'Azul', 'Verde', 'Beige', 'Otro'];
  
  // Colores para mascotas
  petColors: string[] = ['Blanco', 'Negro', 'Café', 'Gris', 'Crema', 'Atigrado', 'Otro'];
  
  vehicleToAdd = new Vehicle('','',0,'','','','','','','');
  vehicleToEdit = new Vehicle('','',0,'','','','','','','');
  vehicles: Vehicle[] = [];
  externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
  externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
  externalVehicles: ExternalVehicle[] = [];

  petToAdd: Partial<Pet> = { name: '', species: 'PERRO', breed: '', color: '', age_years: undefined, house_id: 0, status_validated: 'PERMITIDO' };
  petToEdit: Partial<Pet> & { id?: number } = {};
  petSpecies: { value: string; label: string }[] = [
    { value: 'PERRO', label: 'Perro' },
    { value: 'GATO', label: 'Gato' },
    { value: 'AVE', label: 'Ave' },
    { value: 'PEQUEÑO MAMÍFERO', label: 'Pequeño mamífero' },
    { value: 'ACUÁTICO', label: 'Acuático' },
    { value: 'EXÓTICO', label: 'Exótico' },
    { value: 'OTRO', label: 'Otros' }
  ];
  petStatusList = ['PERMITIDO', 'OBSERVADO', 'DENEGADO'];

  /** Índice del vehículo cuya foto se está subiendo (-1 = ninguno) */
  uploadingVehicleIndex: number = -1;
  /** Índice de la mascota cuya foto se está subiendo (-1 = ninguna) */
  uploadingPetIndex: number = -1;

  constructor(
    private entranceService: EntranceService,
    private auth: AuthService,
    private usersService: UsersService,
    public api: ApiService,
    private toastr: ToastrService,
    private petsService: PetsService,
    private publicReg: PublicRegistrationService
  ){}

  ngOnInit(): void {
    const userId = Number(this.auth.getTokenItem('user_id'));
    if (!userId || userId <= 0) {
      this.toastr.error('No se encontró usuario en sesión.');
      return;
    }

    this.usersService.getUserById(userId).subscribe({
      next: (os: User) => {
        this.userOnSes = os;
        const houseId = Number(os.house_id) || 0;

        if (houseId <= 0) {
          this.toastr.warning('El usuario no tiene casa asociada.');
          return;
        }

        this.loadHouseMembers(houseId);
        this.loadPets(houseId);
        this.loadVehicles(houseId);
        this.loadExternalVehicles();
        this.loadAllHouses();
      },
      error: () => {
        this.toastr.error('Error al cargar información del usuario.');
      }
    });
  }

  private normalizeCategory(value: any): string {
    return (value || '').toString().trim().toUpperCase();
  }

  private safeDataArray(res: any): any[] {
    if (!res) {
      return [];
    }
    if (Array.isArray(res)) {
      return res;
    }
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  private loadHouseMembers(houseId: number): void {
    this.entranceService.getPersonsByHouseId(houseId).subscribe({
      next: (res: any) => {
        const raw = this.safeDataArray(res);

        const list = raw.map((u: any) => {
          const property = this.normalizeCategory(u.property_category || u.person_type || u.relation_type);
          return {
            ...u,
            property_category: property,
            person_type: this.normalizeCategory(u.person_type),
            relation_type: this.normalizeCategory(u.relation_type)
          };
        });

        this.myFamily = list.filter((u: any) => ['PROPIETARIO', 'RESIDENTE', 'INQUILINO', 'ADMINISTRADOR'].includes(u.property_category));
        this.myResidents = list.filter((u: any) => ['PROPIETARIO', 'RESIDENTE', 'ADMINISTRADOR'].includes(u.property_category));
        this.myTenants = list.filter((u: any) => u.property_category === 'INQUILINO');
        this.myVisits = list.filter((u: any) => ['INVITADO', 'VISITA'].includes(this.normalizeCategory(u.property_category || u.person_type || u.relation_type)));

        // fallback a persons?house_id=... si no hay datos en house_members
        if (this.myFamily.length === 0) {
          this.usersService.getPersonsByHouseId(houseId).subscribe({
            next: (res2: any) => {
              const raw2 = this.safeDataArray(res2);
              const list2 = raw2.map((u: any) => {
                const property = this.normalizeCategory(u.property_category || u.person_type || u.relation_type);
                return {
                  ...u,
                  property_category: property,
                  person_type: this.normalizeCategory(u.person_type),
                  relation_type: this.normalizeCategory(u.relation_type)
                };
              });
              this.myFamily = list2.filter((u: any) => ['PROPIETARIO', 'RESIDENTE', 'INQUILINO'].includes(u.property_category));
              this.myResidents = list2.filter((u: any) => ['PROPIETARIO', 'RESIDENTE'].includes(u.property_category));
              this.myTenants = list2.filter((u: any) => u.property_category === 'INQUILINO');
              this.myVisits = list2.filter((u: any) => ['INVITADO', 'VISITA'].includes(this.normalizeCategory(u.property_category || u.person_type || u.relation_type)));
            },
            error: () => {
              // no action
            }
          });
        }
      },
      error: () => {
        this.myFamily = [];
        this.myResidents = [];
        this.myTenants = [];
        this.myVisits = [];
      }
    });
  }

  private loadPets(houseId: number): void {
    this.petsService.getPets({ house_id: houseId }).subscribe({
      next: (res: any) => {
        this.myPets = this.safeDataArray(res);
      },
      error: () => {
        this.myPets = [];
      }
    });
  }

  private loadVehicles(houseId: number): void {
    this.entranceService.getVehiclesByHouseId(houseId).subscribe({
      next: (res: any) => {
        this.myVehicles = this.safeDataArray(res);
      },
      error: () => {
        this.myVehicles = [];
      }
    });
  }

  private loadExternalVehicles(): void {
    this.entranceService.getAllExternalVehicles().subscribe({
      next: (res: any) => {
        this.externalVehicles = this.safeDataArray(res);
      },
      error: () => {
        this.externalVehicles = [];
      }
    });
  }

  private loadAllHouses(): void {
    this.entranceService.getAllHouses().subscribe({
      next: (res: any) => {
        this.houses = this.safeDataArray(res);
      },
      error: () => {
        this.houses = [];
      }
    });
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  openViewPhoto(item: { photo_url?: string }, title: string): void {
    const photoUrl = this.api.getPhotoUrl(item.photo_url || '');
    if (!photoUrl) {
      this.toastr.warning('No hay imagen disponible para mostrar.');
      return;
    }
    this.viewPhotoTitle = title;
    this.viewPhotoUrl = photoUrl;
    this.showViewPhotoDialog = true;
  }

  closeViewPhoto(): void {
    this.showViewPhotoDialog = false;
    this.viewPhotoUrl = null;
    this.viewPhotoTitle = '';
  }

  searchUser(doc_number: string){
    // Validar que sea un documento válido
    const docTrimmed = doc_number?.trim() ?? '';
    const isValidDoc = /^\d{8,}$/.test(docTrimmed); // 8 o más dígitos

    if (!isValidDoc) {
      this.toastr.warning('Por favor ingresa un documento válido (mínimo 8 dígitos)');
      return;
    }

    const isDni = docTrimmed.length === 8;

    // Primero buscar en la base de datos
    this.usersService.getUserByDocNumber(docTrimmed).subscribe(
      (resExistentUser: User) => {
        if (resExistentUser?.user_id) {
          // Usuario existe en BD
          if (resExistentUser.role_system !== 'SN' && resExistentUser.role_system !== 'NINGUNO' && resExistentUser.role_system !== '') {
            this.clean();
            this.toastr.warning('El usuario ya existe en el sistema');
          } else {
            this.toastr.success('Datos obtenidos correctamente desde BD');
            this.userToAdd = resExistentUser;
          }
        } else {
          // No existe en BD
          // Solo usar RENIEC si es DNI (8 dígitos)
          if (isDni) {
            this.fetchFromReniec(docTrimmed);
          } else {
            // Es Carné de Extranjería u otro documento: solo busca en BD
            this.toastr.info('No se encontraron datos en el sistema. Completa los datos manualmente.');
            this.clean();
          }
        }
      },
      (error: any) => {
        console.error('Error consultando BD:', error);
        // Fallback a RENIEC solo si es DNI (8 dígitos)
        if (isDni) {
          this.fetchFromReniec(docTrimmed);
        } else {
          this.toastr.error('Error consultando BD. Completa los datos manualmente.');
          this.clean();
        }
      }
    );
  }

  private fetchFromReniec(doc_number: string){
    this.usersService.getUserFromReniec(doc_number).subscribe(
      (resReniecUser: any) => {
        if (resReniecUser && resReniecUser['success'] && resReniecUser['data']) {
          this.toastr.success('Datos obtenidos desde RENIEC');
          this.userToAdd.type_doc = 'DNI';
          this.userToAdd.first_name = resReniecUser['data']['nombres'] || '';
          this.userToAdd.paternal_surname = resReniecUser['data']['apellido_paterno'] || '';
          this.userToAdd.maternal_surname = resReniecUser['data']['apellido_materno'] || '';
          
          const sexo = (resReniecUser['data']['sexo'] || '').toString().toUpperCase();
          this.userToAdd.gender = (sexo === 'FEMENINO' || sexo === 'F') ? 'F' : (sexo === 'MASCULINO' || sexo === 'M') ? 'M' : sexo || '';
          
          this.userToAdd.birth_date = resReniecUser['data']['fecha_nacimiento'] || '';
          this.userToAdd.civil_status = resReniecUser['data']['estado_civil'] || '';
          this.userToAdd.address_reniec = resReniecUser['data']['direccion_completa'] || '';
          this.userToAdd.district = resReniecUser['data']['distrito'] || '';
          this.userToAdd.province = resReniecUser['data']['provincia'] || '';
          this.userToAdd.region = resReniecUser['data']['departamento'] || '';
        } else {
          this.noData();
        }
      },
      (error: any) => {
        console.error('Error consultando RENIEC:', error);
        this.toastr.error('Error consultando RENIEC. Completa los datos manualmente.');
        this.clean();
      }
    );
  }

  noData(){
    this.clean();
    this.toastr.info('No se encontraron datos');

  }

  newUser(){
    this.userToAdd.property_category = 'PROPIETARIO';
    document.getElementById('myhouse-new-user-button')?.click();
  }

  newTenant(){
    this.userToAdd = User.empty();
    this.userToAdd.property_category = 'INQUILINO';
    this.userToAdd.house_id = this.userOnSes.house_id ?? 0;
    document.getElementById('myhouse-new-user-button')?.click();
  }

  editUser(user: User): void {
    this.userToEdit = { ...user } as User;
    const g = (this.userToEdit.gender || '').toString().toUpperCase();
    this.userToEdit.gender = (g === 'FEMENINO' || g === 'F') ? 'F' : (g === 'MASCULINO' || g === 'M') ? 'M' : g || '';
    document.getElementById('myhouse-edit-user-button')?.click();
  }
  newVisit(){
    document.getElementById('myhouse-new-visit-button')?.click();
  }

  editVisit(user:User){
    this.userToEdit = user;
    document.getElementById('myhouse-edit-visit-button')?.click();
  }
  
  clean(){
    this.userToAdd = User.empty();
    this.userToEdit = User.empty();
    this.vehicleToAdd = new Vehicle('','',0,'','','','');
    this.vehicleToEdit = new Vehicle('','',0,'','','','');
    this.externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
    this.externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
    this.petToAdd = { name: '', species: 'PERRO', breed: '', color: '', house_id: 0, status_validated: 'PERMITIDO' };
    this.petToEdit = {};
  }

  newPet(){
    this.petToAdd = {
      name: '',
      species: 'PERRO',
      breed: '',
      color: '',
      house_id: this.userOnSes.house_id ?? 0,
      status_validated: 'PERMITIDO'
    };
    document.getElementById('myhouse-new-pet-button')?.click();
  }

  editPet(pet: Pet){
    this.petToEdit = { ...pet };
    document.getElementById('myhouse-edit-pet-button')?.click();
  }

  saveNewPet(){
    if (!this.petToAdd.name?.trim() || !this.petToAdd.species || !this.petToAdd.house_id) {
      this.toastr.error('Nombre, especie y casa son obligatorios.');
      return;
    }
    this.petsService.createPet(this.petToAdd).subscribe({
      next: () => {
        this.toastr.success('Mascota registrada correctamente.');
        this.handleSuccess();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Error al guardar la mascota.');
      }
    });
  }

  saveEditPet(){
    const id = this.petToEdit.id ?? (this.petToEdit as any).id;
    if (!id) {
      this.toastr.error('No se puede editar la mascota.');
      return;
    }
    if (!this.petToEdit.name?.trim() || !this.petToEdit.species) {
      this.toastr.error('Nombre y especie son obligatorios.');
      return;
    }
    this.petsService.updatePet(id, this.petToEdit).subscribe({
      next: () => {
        this.toastr.success('Mascota actualizada correctamente.');
        this.handleSuccess();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Error al actualizar la mascota.');
      }
    });
  }

  private handleSuccess() {
    this.clean();
    this.ngOnInit();
  }

  saveNewUser() {
    if (!this.validateUser(this.userToAdd)) {
      this.toastr.error("Por favor, completa todos los campos requeridos correctamente.");
      this.clean();
      return;
    }

    const newPerson: any = {
      type_doc: this.userToAdd.type_doc || 'DNI',
      doc_number: this.userToAdd.doc_number,
      first_name: this.userToAdd.first_name,
      paternal_surname: this.userToAdd.paternal_surname,
      maternal_surname: this.userToAdd.maternal_surname || '',
      gender: this.userToAdd.gender || undefined,
      birth_date: this.userToAdd.birth_date || undefined,
      cel_number: this.userToAdd.cel_number || undefined,
      email: this.userToAdd.email || undefined,
      house_id: this.userOnSes.house_id,
      person_type: ((this.userToAdd as any).property_category || (this.userToAdd as any).person_type || 'RESIDENTE').toUpperCase(),
      status_system: 'ACTIVO',
      status_validated: 'PERMITIDO'
    };

    this.usersService.createPerson(newPerson).subscribe({
      next: () => {
        this.toastr.success('Persona creada correctamente');
        this.handleSuccess();
      },
      error: (error) => {
        if (error?.error?.error && error.error.error.includes('documento')) {
          this.toastr.warning('Ya existe una persona con este documento');
        } else {
          this.toastr.error(error?.error?.error || 'Error al crear la persona.');
        }
        console.error(error);
      }
    });
  }
  
  private validateUser(user: User): boolean {
    if (!user.doc_number || user.doc_number.trim().length < 8) return false;
    if (!user.first_name) return false;
    // Agrega más validaciones según sea necesario.
    return true;
  }

  saveEditUser(){
    const personId = (this.userToEdit as any).person_id || (this.userToEdit as any).id;
    if (personId) {
      const updatePersonPayload: any = {
        first_name: this.userToEdit.first_name,
        paternal_surname: this.userToEdit.paternal_surname,
        maternal_surname: this.userToEdit.maternal_surname,
        cel_number: this.userToEdit.cel_number,
        email: this.userToEdit.email,
        person_type: ((this.userToEdit as any).property_category || (this.userToEdit as any).person_type || 'RESIDENTE').toUpperCase(),
        house_id: this.userOnSes.house_id
      };
      this.usersService.updatePerson(personId, updatePersonPayload).subscribe({
        next: () => {
          this.toastr.success('Persona actualizada correctamente');
          this.handleSuccess();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar la persona');
        }
      });
      return;
    }

    // Fallback: actualizar usuario si no tiene person_id
    this.usersService.updateUser(this.userToEdit).subscribe(resUpdateUser=>{
      if(resUpdateUser){
        this.toastr.success('Usuario actualizado correctamente');
        this.handleSuccess();
      }
    })
  }
// VEHÍCULOS DE RESIDENTES

newVehicle(){
  const houseId = this.userOnSes.house_id ?? 0;
  this.vehicleToAdd.house_id = houseId;
  if (!this.vehicleToAdd.type_vehicle) this.vehicleToAdd.type_vehicle = 'AUTOMOVIL';
  if (!this.vehicleToAdd.category_entry) this.vehicleToAdd.category_entry = 'RESIDENTE';
  if (!this.vehicleToAdd.status_validated) this.vehicleToAdd.status_validated = 'PERMITIDO';
  if (this.houses.length === 0 && houseId) {
    this.houses = [{ house_id: houseId, block_house: '—', lot: null, apartment: null } as House];
  }
  document.getElementById('myhouse-new-vehicle-button')?.click();
}

editVehicle(vehicle:Vehicle){
  this.vehicleToEdit = vehicle;
  document.getElementById('myhouse-edit-vehicle-button')?.click();
}

saveEditVehicle(){
  if(!this.vehicleToEdit.license_plate || !this.vehicleToEdit.house_id||!this.vehicleToEdit.type_vehicle){
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    this.clean();
    return;
  }
  this.entranceService.updateVehicle(this.vehicleToEdit).subscribe({
    next:(resUpdate:any)=>{
      if(resUpdate.success){
        this.toastr.success(resUpdate.message);
        this.toastr.success('Vehículo actualizado correctamente');
        this.handleSuccess();
      }
      else{
        this.toastr.error('Error al actualizar el vehículo');
      }
    },
    error:()=>{
      this.toastr.error('Error al actualizar el vehículo')
    },
  })
}

saveNewVehicle(): void {
  //CAMPOS OBLIGATORIOS
  if(!this.vehicleToAdd.license_plate || !this.vehicleToAdd.house_id||!this.vehicleToAdd.type_vehicle){
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    this.clean();
    return;
  }
  //HASTA AQUÍ
  this.vehicleToAdd.status_system='ACTIVO'
  if (!this.vehicleToAdd.status_validated){
    this.vehicleToAdd.status_validated='PERMITIDO'
  }
  this.entranceService.addVehicle(this.vehicleToAdd).subscribe({
    next:(res:any)=>{
      if(res.success){
        this.toastr.success(res.message);
        this.toastr.success('Vehículo guardado correctamente');
        this.handleSuccess();
      } else {
        this.toastr.error('Error al guardar el vehículo');
      }
    },
    error:(err)=>{
      console.error(err);
      this.toastr.error('Error al guardar el vehículo')
    }
  });
}


  //EXTERNAL VEHICLE
  newExternalVehicle(){
    document.getElementById('myhouse-new-external-vehicle-button')?.click();
  }

  editExternalVehicle(externalVehicle:ExternalVehicle){
    this.externalVehicleToEdit = externalVehicle;
    document.getElementById('myhouse-edit-external-vehicle-button')?.click();
  }

  saveEditExternalVehicle(){
    // Validar campos obligatorios
    if (!this.externalVehicleToEdit.temp_visit_plate || !this.externalVehicleToEdit.temp_visit_doc||!this.externalVehicleToEdit.temp_visit_cel) {
      this.toastr.error('Los campos obligatorios no pueden estar vacíos');
      this.clean();
      return;
    }
  
    this.entranceService.updateExternalVehicle(this.externalVehicleToEdit).subscribe({
      next: (resUpdateExternalVehicle: any) => {
        if (resUpdateExternalVehicle.success) {
          this.toastr.success(resUpdateExternalVehicle.message);
          this.toastr.success('Vehículo externo actualizado correctamente');
          this.handleSuccess();
        } else {
          this.toastr.error('Error al actualizar el vehículo externo');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al actualizar el vehículo externo');
      },
    });
  }
  
  saveNewExternalVehicle(): void {
    // Validar campos obligatorios
    if (!this.externalVehicleToAdd.temp_visit_plate || !this.externalVehicleToAdd.temp_visit_doc||!this.externalVehicleToAdd.temp_visit_cel) {
      this.toastr.error('Los campos obligatorios no pueden estar vacíos');
      this.clean();
      return;
    }
  
    this.externalVehicleToAdd.status_system = 'ACTIVO';
  
    // Asignar un valor predeterminado si no existe
    if (!this.externalVehicleToAdd.status_validated) {
      this.externalVehicleToAdd.status_validated = 'PERMITIDO';
    }
  
    this.entranceService.addExternalVehicle(this.externalVehicleToAdd).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res.message);
          this.handleSuccess();
        } else {
          this.toastr.error('Error al guardar el vehículo externo');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al guardar el vehículo externo');
      },
    });
  }
  


 
  /* SIWTCH ON/OFF
  toggleStatus(vehicle: any): void {
    // Alternar el estado entre 'ACTIVO' e 'INACTIVO'
    vehicle.status_system = vehicle.status_system === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  
    // Realizar una actualización en el servidor
    this.entranceService.updateVehicle(vehicle).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Estado actualizado a ${vehicle.status_system}`);
        } else {
          this.toastr.error('Error al actualizar el estado');
        }
      },
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
        this.toastr.error('Error al actualizar el estado');
      }
    });
  }*/

  /** Sube la foto del vehículo y actualiza su foto_url en el servidor */
  onVehiclePhotoSelect(vehicleIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.toastr.warning('Seleccione una imagen (JPG, PNG o GIF).');
      return;
    }
    
    const vehicle = this.myVehicles[vehicleIndex];
    if (!vehicle) {
      this.toastr.error('Vehículo no encontrado.');
      return;
    }

    this.uploadingVehicleIndex = vehicleIndex;
    this.publicReg.uploadVehiclePhoto(file).subscribe({
      next: (res) => {
        this.uploadingVehicleIndex = -1;
        if (res.success && res.photo_url) {
          // Actualizar la foto_url en el servidor
          vehicle.photo_url = res.photo_url;
          this.entranceService.updateVehicle(vehicle).subscribe({
            next: (updateRes: any) => {
              if (updateRes.success) {
                this.toastr.success('Foto del vehículo cargada correctamente.');
              } else {
                this.toastr.warning('Foto subida pero error al guardar.');
              }
            },
            error: () => {
              this.toastr.warning('Foto subida pero error al guardar.');
            }
          });
        } else {
          this.toastr.error(res.error || 'Error al subir la foto.');
        }
        input.value = '';
      },
      error: (err) => {
        this.uploadingVehicleIndex = -1;
        this.toastr.error(err?.error?.error || err?.message || 'Error al subir la foto.');
        input.value = '';
      }
    });
  }

  /** Sube la foto de la mascota y actualiza su photo_url en el servidor */
  onPetPhotoSelect(petIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.toastr.warning('Seleccione una imagen (JPG, PNG o GIF).');
      return;
    }

    const pet = this.myPets[petIndex];
    if (!pet) {
      this.toastr.error('Mascota no encontrada.');
      return;
    }

    this.uploadingPetIndex = petIndex;
    this.publicReg.uploadPetPhoto(file).subscribe({
      next: (res) => {
        this.uploadingPetIndex = -1;
        if (res.success && res.photo_url) {
          // Actualizar la photo_url en el servidor
          pet.photo_url = res.photo_url;
          this.petsService.updatePet(pet.id || (pet as any).id, pet).subscribe({
            next: (updateRes: any) => {
              if (updateRes.success || updateRes.message) {
                this.toastr.success('Foto de la mascota cargada correctamente.');
              } else {
                this.toastr.warning('Foto subida pero error al guardar.');
              }
            },
            error: () => {
              this.toastr.warning('Foto subida pero error al guardar.');
            }
          });
        } else {
          this.toastr.error(res.error || 'Error al subir la foto.');
        }
        input.value = '';
      },
      error: (err) => {
        this.uploadingPetIndex = -1;
        this.toastr.error(err?.error?.error || err?.message || 'Error al subir la foto.');
        input.value = '';
      }
    });
  }

}



