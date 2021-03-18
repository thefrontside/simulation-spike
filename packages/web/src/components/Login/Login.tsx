import { FC } from 'react';
import { FormInput, Button } from '@cutting/component-library';
import { Formik, Form } from 'formik';
import { WebAuth } from 'auth0-js';
import { Auth as config } from '../../auth0_config';

import styles from './Login.module.scss';

async function submitForm({ username, password }: { username: string; password: string }) {
  const webAuth = new WebAuth({
    domain: config.domain,
    clientID: config.clientId,
    redirectUri: window.location.origin,
    responseType: 'code',
  });

  try {
    await webAuth.login({ realm: 'Username-Password-Authentication', username, password }, console.log);
  } catch (error) {
    console.error(error);
  }
}

export const Login: FC = () => {
  return (
    <section className={styles.main}>
      <Formik
        initialValues={{ username: 'bob@gmail.com', password: 'aaa' }}
        onSubmit={submitForm}
        validate={(values) => {
          console.dir(values);
          return {};
        }}
      >
        {({ isSubmitting, handleChange, values: { username, password }, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <div>
              <input type="hidden" name="state" value={window.location.search.substr(7)} />
              <FormInput name="username" label="User" onChange={handleChange} value={username} />
              <FormInput name="password" label="Password" type="password" onChange={handleChange} value={password} />
            </div>
            <div>
              <Button buttonStyle="primary" disabled={isSubmitting} type="submit">
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};
