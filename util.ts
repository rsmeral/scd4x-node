import {crcCheck, crcCompute} from "./crc";

import {SCD30_ADDRESS} from "./constants";

export const commandToBuffer = (command: number) =>
  Buffer.from([command >> 8, command & 0xFF])

export const write = async (bus: any, buf: Buffer): Promise<void> =>
  bus.i2cWrite(SCD30_ADDRESS, buf.length, buf);

export const read = async (bus: any, length: number): Promise<Buffer> => {
  const buf = Buffer.alloc(length);
  await bus.i2cRead(SCD30_ADDRESS, buf.length, buf);

  console.log(buf);
  const data = crcCheck(buf);

  return data;
}

export const performCommand = async (
  bus: any,
  command: number,
  commandArgs: Buffer = Buffer.from([])
): Promise<void> => {
  await write(bus, Buffer.concat([
    commandToBuffer(command),
    crcCompute(commandArgs)
  ]));  
}

export const performCommandAndRead = async (
  bus: any,
  command: number,
  readLength: number,
  commandArgs: Buffer = Buffer.from([])
): Promise<Buffer> => {
  await performCommand(bus, command, commandArgs);

  return read(bus, readLength);
}