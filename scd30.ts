import {openPromisified} from 'i2c-bus';

import {performCommand, performCommandAndRead} from './util';

import {
  SCD30_CMD_GET_DATA_READY,
  SCD30_CMD_READ_MEASUREMENT,
  SCD30_CMD_START_PERIODIC_MEASUREMENT,
  SCD30_CMD_STOP_PERIODIC_MEASUREMENT,
  SCD30_CMD_SET_MEASUREMENT_INTERVAL
} from './constants';

const I2C_BUS_NUMBER = 1;

type Measurement = {
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
}

let bus;

export const open = async (): Promise<void> => {
  bus = await openPromisified(I2C_BUS_NUMBER)
}

export const close = async (): Promise<void> => {
  bus.close();
}

export const isReady = async (): Promise<boolean> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_GET_DATA_READY, 3);

  const result = response.readUInt16BE(0);

  return result === 1;
}

export const readMeasurement = async (): Promise<Measurement> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_READ_MEASUREMENT, 18);

  const co2Concentration = response.readFloatBE(0);
  const temperature = response.readFloatBE(4);
  const relativeHumidity = response.readFloatBE(8);

  return {
    co2Concentration,
    temperature,
    relativeHumidity
  }
}

export const startContinuousMeasurement = async (pressure: number = 0): Promise<void> => {
  if (pressure < 700 || pressure > 1400) {
    throw new Error('Pressure out of range');
  }

  const pressureUint16 = Buffer.alloc(2);
  pressureUint16.writeUInt16BE(pressure, 0);

  await performCommand(bus, SCD30_CMD_START_PERIODIC_MEASUREMENT, pressureUint16);
}

export const stopContinuousMeasurement = (): Promise<void> =>
  performCommand(bus, SCD30_CMD_STOP_PERIODIC_MEASUREMENT);

export const getMeasurementInterval = async (): Promise<number> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, 3);

  const measurementInterval = response.readUInt16BE(0);

  return measurementInterval;
}

export const setMeasurementInterval = async (interval: number): Promise<void> => {
  if (interval < 2 || interval > 1800) {
    throw new Error('Measurement interval out of range');
  }

  const intervalUint16 = Buffer.alloc(2);
  intervalUint16.writeUInt16BE(interval, 0);
  
  await performCommand(bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, intervalUint16);
}

