/**
 * Serialize JS types to Buffer
 * @param data data to serialize
 * @param encoding string buffer encoding
 */
export const toBuffer = (data: unknown, encoding: BufferEncoding = 'utf-8'): Buffer => {
  if (data instanceof Buffer) {
    return data;
  } else if (typeof data === 'object') {
    return Buffer.from(JSON.stringify(data), encoding);
  } else {
    return Buffer.from((data as any).toString(), encoding);
  }
};
