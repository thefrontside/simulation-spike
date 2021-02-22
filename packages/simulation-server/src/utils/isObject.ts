// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = (x: any): x is Record<string, unknown> => x !== null && Object(x) === x;
