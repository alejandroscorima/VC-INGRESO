
export class Person {
  constructor(
    public type_doc: string,
    public doc_number: string,
    public first_name: string,
    public paternal_surname: string,
    public maternal_surname: string,
    public gender: string,
    public birth_date: string,
    public civil_status: string,
    public profession: string,
    public cel_number: string,
    public email: string,
    public address: string,
    public district: string,
    public province: string,
    public region: string,
    public username: string,
    public password: string,
    public entrance_role: string,
    public latitud: string,
    public longitud: string,
    public photo_url: string,
    public house_id: number,
    public colab_id: number,
    public status: string,
    public reason: string,
    public house_address?: string,
    public user_id?: number,
  ) { }

}
