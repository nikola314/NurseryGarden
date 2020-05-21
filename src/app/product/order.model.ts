export interface Order {
  _id: string;
  product: any;
  isPickedUp: boolean;
  isDelivered: boolean;
  garden: any;
  timestamp: Date;
}
