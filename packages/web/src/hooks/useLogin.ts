import { useMutation, UseMutationResult } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { writeStorage } from '@rehooks/local-storage';

type Credentials = {
  userName: string;
  password: string;
};

const Login = async ({ userName, password }: Credentials) => {
  const response = await axios.post('/api/login', {
    userName,
    password,
  });

  writeStorage('token', 'token');

  return response;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLogin = (): UseMutationResult<AxiosResponse<any>, unknown, Credentials, unknown> => {
  return useMutation(Login);
};
