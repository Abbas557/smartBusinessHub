import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import { User, AuthState } from '../types';
import authApi, {
  LoginPayload,
  RegisterCustomerPayload,
  RegisterOwnerPayload,
  RegisterPayload,
} from '../api/auth.api';
import { setAccessToken } from '../api/axios';

// ─── State & Actions ──────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'SET_USER'; payload: { user: User; accessToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true on mount — we check for existing session first
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  registerOwner: (payload: RegisterOwnerPayload) => Promise<User>;
  registerCustomer: (payload: RegisterCustomerPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initRan = useRef(false);

  // On mount: attempt silent refresh using the httpOnly cookie
  // If cookie is valid, we get a new access token and restore session
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    const initAuth = async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const user = await authApi.getMe();
        dispatch({ type: 'SET_USER', payload: { user, accessToken } });
      } catch {
        // No valid cookie — user is not logged in, that's fine
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // Listen for logout events fired by Axios interceptor (refresh token expired)
  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user, accessToken } = await authApi.login(payload);
    setAccessToken(accessToken);
    dispatch({ type: 'SET_USER', payload: { user, accessToken } });
    return user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    dispatch({ type: 'SET_USER', payload: { user, accessToken } });
    return user;
  }, []);

  const registerOwner = useCallback(async (payload: RegisterOwnerPayload) => {
    const { user, accessToken } = await authApi.registerOwner(payload);
    setAccessToken(accessToken);
    dispatch({ type: 'SET_USER', payload: { user, accessToken } });
    return user;
  }, []);

  const registerCustomer = useCallback(async (payload: RegisterCustomerPayload) => {
    const { user, accessToken } = await authApi.registerCustomer(payload);
    setAccessToken(accessToken);
    dispatch({ type: 'SET_USER', payload: { user, accessToken } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        registerOwner,
        registerCustomer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
