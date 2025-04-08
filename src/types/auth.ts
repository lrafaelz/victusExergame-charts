// filepath: c:\subDesktop\Unipampa\Projects\Victus\victusExergame-graphs\src\types\auth.ts

import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  logout: () => void;
}
