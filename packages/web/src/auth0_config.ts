import { Auth0ProviderOptions } from '@auth0/auth0-react';

export const Auth: Auth0ProviderOptions = {
  // domain: 'cutting.eu.auth0.com',
  domain: `localhost:3000/auth0/00000005-a26a-481a-bfff-fff00000000c`,
  clientId: 'IsuLUyWaFczCbAKQrIpVPmyBTFs4g5iq',
  clientSecret: 'WKkaiheEDD3-EL6RJVVm23AgmAbK_CyRNfvkdJuconSQcZzxwb_ur8514rWyBcDQ',
  issuer: 'http://localhost:5000',
  audience: 'default',
};
