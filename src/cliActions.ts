import {table} from 'table';

import {
  isDataReady,
  readMeasurement,
  startContinuousMeasurement,
  stopContinuousMeasurement,
  setMeasurementInterval,
  getMeasurementInterval,
  setAutomaticSelfCalibration,
  isAutomaticSelfCalibrationActive,
  getForcedRecalibrationValue,
  setForcedRecalibrationValue,
  setTemperatureOffset,
  getTemperatureOffset,
  setAltitudeCompensation,
  getAltitudeCompensation,
  getFirmwareVersion,
  softReset
} from './scd30';

const print = console.log;
const error = (msg: string): void => console.error('Error:', msg);

export const isDataReadyAction = async (): Promise<void> => {
  const ready = await isDataReady();

  print(`Data is ${ready ? 'ready' : 'NOT ready'}.`);
};

export const readMeasurementAction = async (): Promise<void> => {
  const ready = await isDataReady();

  if (!ready) {
    error('No measurement available.');
    return;
  }

  const measurement = await readMeasurement();

  const output = table([
    ['CO2 concentration', `${Math.round(measurement.co2Concentration)} ppm`],
    ['Temperature', `${Math.round(measurement.temperature * 100) / 100}°C`],
    ['Humidity', `${Math.round(measurement.relativeHumidity * 100) / 100}%`]
  ]);

  print(output);
};

export const startContinuousMeasurementAction = async (pressureString?: string): Promise<void> => {
  const pressure = pressureString ? parseInt(pressureString) : 0;

  if (isNaN(pressure)) {
    error('Invalid value provided for pressure. Must be between 700 and 1400 mBar, inclusive.');
    return;
  }

  await startContinuousMeasurement(pressure);

  print('Continuous measurement started.');
  if (pressureString) {
    print(`Ambient pressure compensation set to ${pressure} mBar`);
  }
};

export const stopContinuousMeasurementAction = async (): Promise<void> => {
  await stopContinuousMeasurement();

  print('Continuous measurement stopped.');
};

export const setMeasurementIntervalAction = async (intervalString: string): Promise<void> => {
  const interval = intervalString ? parseInt(intervalString) : 0;

  if (isNaN(interval)) {
    error('Invalid value provided for interval. Must be between 2 and 1800 seconds, inclusive.');
    return;
  }

  await setMeasurementInterval(interval);

  print(`Continuous measurement interval set to ${interval} seconds`);
};

export const getMeasurementIntervalAction = async (): Promise<void> => {
  const interval = await getMeasurementInterval();

  const output = table([['Continuous measurement interval', `${interval} seconds`]]);

  print(output);
};

export const startAscAction = async (): Promise<void> => {
  await setAutomaticSelfCalibration(true);

  print('Automatic self-calibration started.');
};

export const stopAscAction = async (): Promise<void> => {
  await setAutomaticSelfCalibration(false);

  print('Automatic self-calibration stopped.');
};

export const isAscActiveAction = async (): Promise<void> => {
  const active = await isAutomaticSelfCalibrationActive();

  print(`Automatic self-calibration is ${active ? 'active' : 'NOT active'}.`);
};

export const setFrcValueAction = async (co2ppmString: string): Promise<void> => {
  const co2ppm = co2ppmString ? parseInt(co2ppmString) : 0;

  if (isNaN(co2ppm)) {
    error('Invalid value provided for reference CO2 concentration. Must be between 400 and 2000 ppm, inclusive.');
    return;
  }

  await setForcedRecalibrationValue(co2ppm);

  print(`Reference CO2 concentration for forced re-calibration set to ${co2ppm} ppm`);
};

export const getFrcValueAction = async (): Promise<void> => {
  const frcValue = await getForcedRecalibrationValue();

  const output = table([['Forced re-calibration value', `${frcValue} ppm`]]);

  print(output);
};

export const setTempOffsetAction = async (offsetString: string): Promise<void> => {
  const offset = offsetString ? parseInt(offsetString) : 0;

  if (isNaN(offset)) {
    error('Invalid value provided for temperature offset. Must be an integer.');
    return;
  }

  await setTemperatureOffset(offset);

  print(`Temperature offset set to ${offset}°C`);
};

export const getTempOffsetAction = async (): Promise<void> => {
  const offset = await getTemperatureOffset();

  const output = table([['Temperature offset', `${offset}°C`]]);

  print(output);
};

export const setAltitudeCompensationAction = async (altitudeString: string): Promise<void> => {
  const altitude = altitudeString ? parseInt(altitudeString) : 0;

  if (isNaN(altitude)) {
    error('Invalid value provided for altitude. Must be an integer.');
    return;
  }

  await setAltitudeCompensation(altitude);

  print(`Altitude set to ${altitude} meters above sea level.`);
};

export const getAltitudeCompensationAction = async (): Promise<void> => {
  const offset = await getAltitudeCompensation();

  const output = table([['Altitude', `${offset} meters above sea level`]]);

  print(output);
};

export const getFirmwareVersionAction = async (): Promise<void> => {
  const version = await getFirmwareVersion();

  const output = table([['Firmware version', `${version}`]]);

  print(output);
};

export const softResetAction = async (): Promise<void> => {
  await softReset();

  print('Soft reset performed.');
};
