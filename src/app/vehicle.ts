
export class Vehicle {
  constructor(
    public plate: string,
    public house_id: number,
    public status: string,
    public type: string,
    public reason: string,
    public category: string,
    public house_address?: string,
    public block?: string,
    public lot?: string,
    public apartment?: string,
    public vehicle_id?: number,
  ) { }

}
