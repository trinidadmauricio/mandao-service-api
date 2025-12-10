/**
 * CustomerAddress Entity
 */

export class CustomerAddress {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly customer_id: string,
    public readonly label: string,
    public readonly recipient_name: string,
    public readonly phone: string,
    public readonly street: string,
    public readonly street_line_2: string | null,
    public readonly city: string,
    public readonly state: string,
    public readonly zip_code: string,
    public readonly country: string,
    public readonly lat: number | null,
    public readonly lng: number | null,
    public readonly instructions: string | null,
    public readonly is_default: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}
}

