
export class ExternalVehicle {
  constructor(
    public temp_visit_name: string,
    public temp_visit_doc: string,
    public temp_visit_plate: string,
    public temp_visit_cel: string,
    public temp_visit_type: string,
    public status_validated: string,
    public status_reason: string,
    public status_system: string,
    public temp_visit_id?: number,
  ) { }

}
