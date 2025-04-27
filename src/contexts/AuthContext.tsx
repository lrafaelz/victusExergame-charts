import { createContext, useEffect, useState, useContext } from 'react';
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

  useEffect(() => {
    if (user)
      fetchUserName(user)
        .then(name => {
          if (name) {
            setUser(prevUser => {
              if (prevUser === null) return null;
              return {
                ...prevUser,
                name: name,
              };
            });
          }
        })
        .catch(error => {
          console.error('Error fetching user name:', error);
        });
  }, [user]);

  const fetchUserName = async (user: UserInfo) => {
    const userRef = doc(db, 'VictusExergame', 'SRF', 'Fisioterapeutas', user.email!);
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
