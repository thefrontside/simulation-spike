export const epochTime = (date = Date.now()): number => Math.floor(date / 1000);

export const expiresAt = (hours = 1): number => epochTime() + hours * 60 * 60 * 1000;
