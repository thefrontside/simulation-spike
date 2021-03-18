import { ChangeEvent, FC } from 'react';
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
        validate={() => ({})}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form data-test-sign-in-form noValidate>
            <div>
              <input type="hidden" value={window.location.search.substr(7)} />
              <FormInput name="username" label="Email" onChange={(e: ChangeEvent) => setFieldValue('username', e)} />
              <FormInput
                name="password"
                label="Password"
                type="password"
                onChange={(e: ChangeEvent) => setFieldValue('password', e)}
              />
            </div>
            <div>
              <Button buttonStyle="primary" disabled={isSubmitting}>
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};
