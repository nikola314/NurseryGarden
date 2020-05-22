import { Product } from '../product/product.model';
import { Order } from '../product/order.model';

// different model for frontend and for backend
export interface Garden {
  id: string;
  name: string;
  location: string;
  water: number;
  temperature: number;
  occupied: number;
  width: number;
  height: number;
  empty: number;
  slots: [Slot];
  warehouse: [
    {
      product: Product;
      count: number;
    }
  ];
  orders: [Order];
}

export interface Slot {
  _id: string;
  timePlanted: string;
  positionX: number;
  positionY: number;
  product: any;
}

export interface GardenBackendModel {
  _id: string;
  name: string;
  location: string;
  water: number;
  temperature: number;
  occupied: number;
  height: number;
  width: number;
  owner: string;
  slots: [Slot];
  warehouse: [
    {
      product: Product;
      count: number;
    }
  ];
  orders: [Order];
}
