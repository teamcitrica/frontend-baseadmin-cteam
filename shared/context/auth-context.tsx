"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { User, type Session } from "@supabase/auth-helpers-nextjs";
import { AuthError, WeakPassword } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { useSupabase } from "./supabase-context";

interface AuthValue {
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{
    respData: {
      user: User;
      session: Session;
      weakPassword?: WeakPassword | undefined;
    } | null;
    respError: AuthError | null;
  }>;
  signUpWithPassword: (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string }
  ) => Promise<{
    respData: any;
    respError: AuthError | null;
  }>;
  signOut: () => void;
  userSession: Session | null;
  getUserInfo: (id: string) => void;
  userInfo: {
    id: string;
    role_id?: number;
    first_name?: string;
    last_name?: string;
    name?: string;
    is_switchable?: boolean;
  } | null;
  changeRole: (v: number) => void;
  loading: boolean;
  isInitializing: boolean;
}

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service_role_key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;
let adminAuthClient: any = null;

if (supabase_url && service_role_key) {
  const supabase = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  adminAuthClient = supabase.auth.admin;
}

const AuthContext = createContext<AuthValue>({} as AuthValue);

export const AuthContextProvider = ({ children }: { children: any }) => {
  const { supabase } = useSupabase();
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);


  const changeRole = (newrole: number) => {
    const newUser = {
      ...userInfo,
      role_id: newrole,
    };

    setUserInfo(newUser);
  };

  // Función para iniciar sesión con correo y contraseña
  const signInWithPassword = async (email: string, password: string) => {
    let respData = null;
    let respError = null;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error !== null) {
        respError = error;
        console.log("error ", error);
      } else {
        respData = data;
        console.log("DATA!! ", data);

        if (data.user && data.session) {
          console.log(data.user.id);
          setUserSession(data.session);
          await getUserInfo(data.user.id);
        }
      }
    } catch (error) {
      console.log(error);
    }

    return { respData, respError };
  };

  // Función para registrar un nuevo usuario
  const signUpWithPassword = async (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string }
  ) => {
    let respData = null;
    let respError = null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role_id: 1,
          },
        },
      });

      if (error !== null) {
        respError = error;
        console.log("Signup error:", error);
      } else {
        respData = data;
        console.log("Signup successful:", data);

        if (data.session && data.user) {
          setUserSession(data.session);
          const userId = data.user.id;
          // Esperar un poco para que el trigger de la base de datos cree el usuario
          setTimeout(async () => {
            await getUserInfo(userId);
          }, 500);
        }
      }
    } catch (error) {
      console.log("Signup catch error:", error);
      respError = error as AuthError;
    }

    return { respData, respError };
  };

  // Función para cerrar sesión
  const signOut = async () => {
    console.log("LOGOUT - Iniciando proceso de cierre de sesión");

    try {
      // Intentar logout con scope global primero
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.warn("Error en logout global:", error);

        // Si falla el global, intentar local
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });

        if (localError) {
          console.error("Error en logout local:", localError);
        } else {
          console.log("✅ Logout local exitoso");
        }
      } else {
        console.log("✅ Logout global exitoso");
      }
    } catch (error) {
      console.error("Error inesperado en signOut:", error);
    } finally {
      // SIEMPRE limpiar el estado local, incluso si el logout falla
      setUserSession(null);
      setUserInfo(null);
      console.log("✅ Estado local limpiado");
    }
  };

  // Función para obtener la información del usuario
  const getUserInfo = async (id: string) => {
    console.log("llamando..");

    try {
      const { data: userData, error } = await supabase
        .rpc('get_user_with_role', { user_id: id })

      if (error) {
        console.error('Error con función get_user_with_role:', error);
        return;
      }

      if (userData && userData.length > 0) {
        console.log("DATA USER ****", userData[0]);
        setUserInfo(userData[0]);
      } else {
        console.log('No se encontró información del usuario');
      }

    } catch (error) {
      console.error('Error general obteniendo usuario:', error);
    }
  };

  // useEffect para suscribirse a los cambios de autenticación
  useEffect(() => {
    console.log("CHECO USER x");

    // Verificar sesión existente al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserSession(session);
        getUserInfo(session.user.id);
      }
      setLoading(false);
      setIsInitializing(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("SUPA BASE evento", event);
        console.log("SUPA BASE SESION", session);
        if (session !== null) {
          setUserSession(session);
          getUserInfo(session.user.id);
        } else {
          setUserSession(null);
          setUserInfo(null);
        }
        setLoading(false);
        setIsInitializing(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInWithPassword,
        signUpWithPassword,
        userInfo,
        getUserInfo,
        signOut,
        userSession,
        changeRole,
        loading,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
