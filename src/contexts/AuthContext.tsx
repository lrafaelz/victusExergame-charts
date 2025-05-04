import { createContext, useEffect, useState, useContext, useRef } from 'react';
import db, { auth } from '../firebase';
import { AuthContextType, UserInfo } from '../types/auth';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext<AuthContextType & { loading: boolean }>({
  user: null,
  logout: () => {},
  saveUser: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  // Flag para evitar atualizações cíclicas
  const isUpdatingName = useRef(false);
  // Cache para nome do usuário
  const nameCache = useRef<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser as UserInfo);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito separado para buscar nome do usuário, evitando ciclos
  useEffect(() => {
    // Se não há usuário ou já estamos atualizando, não fazer nada
    if (!user || isUpdatingName.current) return;

    // Se já temos o nome do usuário no objeto, não precisamos buscar
    if (user.name) return;

    // Se já temos o nome em cache, use-o diretamente
    if (user.email && nameCache.current[user.email]) {
      const cachedName = nameCache.current[user.email];
      isUpdatingName.current = true;
      setUser(prevUser => {
        if (prevUser === null) return null;
        return { ...prevUser, name: cachedName };
      });
      isUpdatingName.current = false;
      return;
    }

    // Caso contrário, busque do Firestore
    isUpdatingName.current = true;
    fetchUserName(user)
      .then(name => {
        if (name && user.email) {
          // Atualizar cache
          nameCache.current[user.email] = name;
          // Atualizar state
          setUser(prevUser => {
            if (prevUser === null) return null;
            return { ...prevUser, name };
          });
        }
      })
      .catch(error => {
        console.error('Error fetching user name:', error);
      })
      .finally(() => {
        isUpdatingName.current = false;
      });
  }, [user]); // Incluindo user como dependência completa

  const fetchUserName = async (user: UserInfo) => {
    if (!user.email) return null;

    const userRef = doc(db, 'VictusExergame', 'SRF', 'Fisioterapeutas', user.email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().nome;
    } else {
      return null;
    }
  };

  const logout = async () => {
    await auth
      .signOut()
      .then(() => {
        setUser(null);
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  };

  const saveUser = async (user: UserInfo) => {
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, logout, saveUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
