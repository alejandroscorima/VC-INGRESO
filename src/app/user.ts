export class User {
  constructor(
    public type_doc: string,
    public doc_number: string,
    public first_name: string,
    public paternal_surname: string,
    public maternal_surname: string,
    public gender: string,
    public birth_date: string,
    public cel_number: string,
    public email: string,
    public role_system: string, // Renombrado para coincidir
    public username_system: string,
    public password_system: string,
    public property_category: string,
    public house_id: number,
    public photo_url: string,
    public status_validated: string,
    public status_reason: string,
    public status_system: string,
    public civil_status: string,
    public profession: string,
    public address_reniec: string,
    public district: string,
    public province: string,
    public region: string,
    // Opcionales, por si no siempre están presentes
    public block_house?: string,
    public lot?: number,
    public apartment?: string,
    public user_id?: number, // Incluido según la lista
  ) {}
}
