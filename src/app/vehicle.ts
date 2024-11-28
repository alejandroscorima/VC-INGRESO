
export class Vehicle {
  constructor(
    public license_plate: string,
    public type_vehicle: string,
    public house_id: number,
    public status_validated: string,
    public status_reason: string,
    public status_system: string,
    public category_entry: string,
    public block_house?: string,
    public lot?: string,
    public apartment?: string,
    public vehicle_id?: number,
  ) { }

}
