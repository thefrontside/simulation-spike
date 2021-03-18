export const redirect = ({ state }: { state: string }): string => `
<p>Found. Redirecting to <a href="/u/login?state=${state}">/u/login?state=${state}</a></p>
`;
