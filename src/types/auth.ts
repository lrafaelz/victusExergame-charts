// filepath: c:\subDesktop\Unipampa\Projects\Victus\victusExergame-graphs\src\types\auth.ts

export interface User {
    id: string;
    email: string;
    name: string;
    // Add other user properties as needed
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}