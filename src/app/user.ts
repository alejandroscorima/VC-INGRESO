/*
export class User {
  constructor(
    public doc_number: string,
    public first_name: string,
    public last_name: string,
    public gender: string,
    public username: string,
    public password: string,
    public area_id: number,
    public campus_id: number,
    public position: string,
    public entrance_role: string,
    public user_id?: number,
  ) { }

}

*/
export class User {

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
  public category: string,
  public status: string,
  public reason: string,
  public block?: string,
  public lot?: string,
  public apartment?: string,
  public user_id?: number,
){}


}

