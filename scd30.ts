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
};

let bus;

export const open = async (): Promise<void> => {
  bus = await openPromisified(I2C_BUS_NUMBER);
};

export const close = async (): Promise<void> => {
  bus.close();
};

/**
 * Used to determine if a measurement can be read from the sensor’s buffer.
 * Whenever there is a measurement available from the internal buffer this function returns true, and false otherwise.
 * As soon as the measurement has been read, the return value changes to false.
 * It is recommended to call this function before calling `readMeasurement`.
 */
export const isDataReady = async (): Promise<boolean> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_GET_DATA_READY, 3);

  const result = response.readUInt16BE(0);

  return result === 1;
};

/**
 * Read a measurement of CO2 concentration, temperature, and humidity.
 * Make sure to call `isDataReady` before calling this.
 */
export const readMeasurement = async (): Promise<Measurement> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_READ_MEASUREMENT, 18);

  const co2Concentration = response.readFloatBE(0);
  const temperature = response.readFloatBE(4);
  const relativeHumidity = response.readFloatBE(8);

  return {
    co2Concentration,
    temperature,
    relativeHumidity
  };
};

/**
 * Starts continuous measurement of CO2 concentration, temperature, and humidity.
 * Measurement data which is not read from the sensor will be overwritten.
 * The measurement interval is adjustable via `setMeasurementInterval`, initial measurement rate is 2s.
 *
 * Continuous measurement status is saved in non-volatile memory. When the sensor is powered down while continuous
 * measurement mode is active, SCD30 will measure continuously after repowering.
 *
 * The CO2 measurement value can be compensated for ambient pressure. Setting the ambient pressure will overwrite
 * previous settings of altitude compensation. Setting the argument to zero will deactivate the ambient pressure
 * compensation (default ambient pressure = 1013.25 mBar). For setting a new ambient pressure when continuous
 * measurement is running, you have to call `startContinuousMeasurement` again.
 *
 * @param pressure Ambient pressure in mBar. Must be a value between 700 and 1400.
 */
export const startContinuousMeasurement = async (pressure = 0): Promise<void> => {
  if (pressure < 700 || pressure > 1400) {
    throw new Error('Pressure out of range');
  }

  const pressureUint16 = Buffer.alloc(2);
  pressureUint16.writeUInt16BE(pressure, 0);

  await performCommand(bus, SCD30_CMD_START_PERIODIC_MEASUREMENT, pressureUint16);
};

/**
 * Stops continuous measurement.
 */
export const stopContinuousMeasurement = (): Promise<void> => performCommand(bus, SCD30_CMD_STOP_PERIODIC_MEASUREMENT);

/**
 * Returns current interval of continuous measurement.
 */
export const getMeasurementInterval = async (): Promise<number> => {
  const response = await performCommandAndRead(bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, 3);

  const measurementInterval = response.readUInt16BE(0);

  return measurementInterval;
};

/**
 * Sets the interval of continuous measurement.
 * Initial value is 2s. The chosen measurement interval is saved in non-volatile memory and thus is not reset
 * to its initial value after power up.
 *
 * @param interval Measurement interval in seconds. Must be a value between 2 and 1800.
 */
export const setMeasurementInterval = async (interval: number): Promise<void> => {
  if (interval < 2 || interval > 1800) {
    throw new Error('Measurement interval out of range');
  }

  const intervalUint16 = Buffer.alloc(2);
  intervalUint16.writeUInt16BE(interval, 0);

  await performCommand(bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, intervalUint16);
};
