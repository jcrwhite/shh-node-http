export const toNumber = (v: number | string | boolean | undefined): number => {
  if (typeof v === 'number') {
    return v;
  }
  if (!v) {
    return 0;
  }
  return Number(v);
};
