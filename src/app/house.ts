export class House {
  constructor(
    public block_house: string,
    public lot: number,
    public apartment: string | null,
    public status_system: string,
    public house_id?: number,
    public house_type?: 'CASA' | 'DEPARTAMENTO' | 'LOCAL COMERCIAL' | 'OTRO',
    /** 1/0 desde API: existe al menos un PROPIETARIO en persons para esta casa */
    public owner_registered?: number | boolean
  ) {}
}

