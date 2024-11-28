
export class Vehicle {
  constructor(
    public license_plate: string,
    public house_id: number,
    public type_vehicle: string,
    public status_validated: string,
    public status_reason: string,
    public status_system: string,
    public category_entry: string,
    public house_address?: string,
    public block?: string,
    public lot?: string,
    public apartment?: string,
    public vehicle_id?: number,
  ) { }

}
