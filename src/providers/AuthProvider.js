import React, { useEffect, useState, useContext } from 'react';

import { auth } from '../firebase-config';

import { dbFirestore } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async(user) => {

      if (user){

        const userRef = doc(dbFirestore, "users", user.email);
        const userSnap = await getDoc(userRef);

        const data = userSnap.data();

        if (data)
          user.role = userSnap.data().role;

      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}