
export class Cliente {
  constructor(
    public doc_number: string,
    public client_name: string,
    public birth_date: string,
    public gender: string,
    public address: string,
    public distrito: string,
    public provincia: string,
    public departamento: string,
    public fecha_registro: string,
    public sala_registro: string,
    public condicion: string,
    public motivo: string,
  ) { }

}
