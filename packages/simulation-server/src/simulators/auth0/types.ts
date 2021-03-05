export type Auth0QueryParams = {
  state: string;
  code: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  client_id: string;
  nonce: string;
};

export type OauthTokenBody = {
  client_id: string;
  code_verifier: string;
  code: string;
  grant_type: string;
  redirect_uri: string;
};
