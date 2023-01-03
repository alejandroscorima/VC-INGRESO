import { Product } from "./product";

export class Item {
  constructor(
    public lugar: string,
    public area: string,
    public cantidad: number,
    public tipo: string,
    public codigo: string,
    public descripcion: string,
    public fabricante: string,
    public marca: string,
    public modelo: string,
    public serie: string,
    public registro: string,
    public numero: string,
    public ubicacion: string,
    public propietario: string,
    public observacion: string,
    public estado: string,
    public id?: number,

  ) { }
}
