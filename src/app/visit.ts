export class Visit { //cambiar a logs
  constructor(
    public doc_number: string,
    public name: string,
    public date_entry: string,//
    public status_validates: string,//
    public operator: string,//
    public date_exit?: string,//
    public house_address?: string,
    public visits?: number,//
  ) { }

}
