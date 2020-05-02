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
}

export interface Slot {
  timeToGrow: number; //in ms
  timePlanted: Date;
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
}
