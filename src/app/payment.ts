
export class Payment {
  constructor(
    public client_id: number,
    public date_start: string,
    public date_expire: string,
    public payment_date: string,
    public error: string,
    public payment_id?: number,
  ) { }

}
