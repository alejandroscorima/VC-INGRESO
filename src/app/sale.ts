import { Item } from "./item";

export class Sale {
  constructor(
    public products: Item[],
    public code: string,
    public total: number,
    public date: string,
    public hour: string,
    public id?: number,
) { }
}
