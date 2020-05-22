export interface Order {
  _id: string;
  product: any;
  count: number;
  isPickedUp: boolean;
  isDelivered: boolean;
  garden: any;
  timestamp: Date;
}
