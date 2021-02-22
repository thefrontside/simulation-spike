import { ChangeEvent, FC, useState } from 'react';
import { FormInput, Button } from '@cutting/component-library';
import { useLogin } from 'src/hooks/useLogin';

import styles from './Login.module.scss';

const handler = (handler: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) =>
  handler(e.target.value);

export const Login: FC = () => {
  const [email, setEmail] = useState('bob@gmail');
  const [password, setPassword] = useState('aaaaaa');
  const { mutate: login } = useLogin();

  return (
    <section className={styles.main}>
      <div>
        <FormInput name="email" label="Email" value={email} onChange={handler(setEmail)} />
        <FormInput name="password" label="Password" value={password} type="password" onChange={handler(setPassword)} />
      </div>
      <div>
        <Button buttonStyle="primary" type="button" onClick={() => login({ userName: email, password })}>
          Submit
        </Button>
      </div>
    </section>
  );
};
