export class Product {
  constructor(
    public code: string,
    public name: string,
    public description:string,
    public price: number,
    public stock: number,
    public id?: number,
) { }
}
