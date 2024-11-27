
export class Visit {
  constructor(
    public doc_number: string,
    public name: string,
    public date_entry: string,
    public obs: string,
    public operator: string,
    public date_exit?: string,
    public house_address?: string,
    public visits?: number,
  ) { }

}
