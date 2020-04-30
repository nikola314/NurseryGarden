// different model for frontend and for backend
export interface Garden {
  id: string;
  name: string;
  location: string;
  water: number;
  temperature: number;
  occupied: number;
  empty: number;
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
}
