export interface AuthData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  date: Date;
  isCompany: boolean;
  approved: boolean;
  username: string;
  location: string;
}

export interface SignedUserData {
  token: string;
  expiresIn: number;
  userId: string;
  isAdmin: boolean;
  isCompany: boolean;
}
