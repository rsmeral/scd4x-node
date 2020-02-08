import {CRC} from 'crc-full';

const CRC8 = new CRC('crc8', 8, 0x31, 0xff, 0x00, false, false);

const crcMatches = (buffer: Buffer, crc: number): boolean => CRC8.compute(buffer) === crc;

export const crcCheck = (buf: Buffer): Buffer => {
  if (buf.length % 3 !== 0) {
    throw new Error('Wrong buffer length for CRC check');
  }

  const resultBuffer = Buffer.alloc((buf.length * 2) / 3);

  for (let i = 0; i < buf.length / 3; i++) {
    const receivedBytes = buf.slice(i * 3, i * 3 + 2);

    const crcByte = buf[i * 3 + 2];

    if (!crcMatches(receivedBytes, crcByte)) {
      throw new Error('CRC error');
    }

    resultBuffer.set(receivedBytes, i * 2);
    console.log(resultBuffer);
  }

  return resultBuffer;
};

export const crcCompute = (buf: Buffer): Buffer => {
  if (buf.length % 2 !== 0) {
    throw new Error('Wrong buffer length for CRC computation');
  }

  const outBuffer = Buffer.alloc((buf.length * 3) / 2);

  for (let i = 0; i < buf.length / 2; i++) {
    const inBytes = buf.slice(i * 2, i * 2 + 1);
    const crcByte = CRC8.compute(inBytes);

    outBuffer.set(inBytes, i * 3);
    outBuffer.set([crcByte], i * 3 + 2);
  }

  return outBuffer;
};
