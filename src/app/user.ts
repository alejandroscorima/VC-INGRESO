
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
