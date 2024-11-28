export class House {

constructor(
  public block_house: string,
  public lot: number,
  public apartment: string | null,
  public status_system: string,
  public house_id?: number
){}
}

