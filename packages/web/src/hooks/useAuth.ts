import { useLocalStorage } from '@rehooks/local-storage';
export const useAuth = (): string | null => {
  const [token] = useLocalStorage('token');

  return token;
};
