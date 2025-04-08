import { User } from 'firebase/auth';

export interface UserInfo extends User {
  email: string | null;
  uid: string;
  name?: string;
  loginHistory?: {
    date: string;
    time: string;
  }[];
}

export interface AuthContextType {
  user: UserInfo | null;
  logout: () => void;
  saveUser: (user: UserInfo) => void;
}
