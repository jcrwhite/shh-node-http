export const safeToString = (v: number | string | boolean | undefined): string => (v !== undefined ? v.toString() : '');
