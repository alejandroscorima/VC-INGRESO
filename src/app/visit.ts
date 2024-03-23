
export class Visit {
  constructor(
    public doc_number: string,
    public name: string,
    public age: string,
    public gender: string,
    public date_entrance: string,
    public hour_entrance: string,
    public obs: string,
    public house_address?: string,
    public visits?: number,
  ) { }

}
