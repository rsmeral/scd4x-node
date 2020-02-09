import {table} from 'table';

import {SCD30} from './scd30';

const print = console.log;
const error = (msg: string): void => console.error('Error:', msg);

export const isDataReadyAction = async (scd30: SCD30): Promise<void> => {
  const ready = await scd30.isDataReady();

  print(`Data is ${ready ? 'ready' : 'NOT ready'}.`);
};

export const readMeasurementAction = async (scd30: SCD30): Promise<void> => {
  const ready = await scd30.isDataReady();

  if (!ready) {
    error('No measurement available.');
    return;
  }

  const measurement = await scd30.readMeasurement();

  const output = table([
    ['CO2 concentration', `${Math.round(measurement.co2Concentration)} ppm`],
    ['Temperature', `${Math.round(measurement.temperature * 100) / 100}°C`],
    ['Humidity', `${Math.round(measurement.relativeHumidity * 100) / 100}%`]
  ]);

  print(output);
};

export const startContinuousMeasurementAction = async (scd30: SCD30, pressureString?: string): Promise<void> => {
  const pressure = pressureString ? parseInt(pressureString) : 0;

  if (isNaN(pressure)) {
    error('Invalid value provided for pressure. Must be between 700 and 1400 mBar, inclusive.');
    return;
  }

  await scd30.startContinuousMeasurement(pressure);

  print('Continuous measurement started.');
  if (pressureString) {
    print(`Ambient pressure compensation set to ${pressure} mBar`);
  }
};

export const stopContinuousMeasurementAction = async (scd30: SCD30): Promise<void> => {
  await scd30.stopContinuousMeasurement();

  print('Continuous measurement stopped.');
};

export const setMeasurementIntervalAction = async (scd30: SCD30, intervalString: string): Promise<void> => {
  const interval = intervalString ? parseInt(intervalString) : 0;

  if (isNaN(interval)) {
    error('Invalid value provided for interval. Must be between 2 and 1800 seconds, inclusive.');
    return;
  }

  await scd30.setMeasurementInterval(interval);

  print(`Continuous measurement interval set to ${interval} seconds`);
};

export const getMeasurementIntervalAction = async (scd30: SCD30): Promise<void> => {
  const interval = await scd30.getMeasurementInterval();

  const output = table([['Continuous measurement interval', `${interval} seconds`]]);

  print(output);
};

export const startAscAction = async (scd30: SCD30): Promise<void> => {
  await scd30.setAutomaticSelfCalibration(true);

  print('Automatic self-calibration started.');
};

export const stopAscAction = async (scd30: SCD30): Promise<void> => {
  await scd30.setAutomaticSelfCalibration(false);

  print('Automatic self-calibration stopped.');
};

export const isAscActiveAction = async (scd30: SCD30): Promise<void> => {
  const active = await scd30.isAutomaticSelfCalibrationActive();

  print(`Automatic self-calibration is ${active ? 'active' : 'NOT active'}.`);
};

export const setFrcValueAction = async (scd30: SCD30, co2ppmString: string): Promise<void> => {
  const co2ppm = co2ppmString ? parseInt(co2ppmString) : 0;

  if (isNaN(co2ppm)) {
    error('Invalid value provided for reference CO2 concentration. Must be between 400 and 2000 ppm, inclusive.');
    return;
  }

  await scd30.setForcedRecalibrationValue(co2ppm);

  print(`Reference CO2 concentration for forced re-calibration set to ${co2ppm} ppm`);
};

export const getFrcValueAction = async (scd30: SCD30): Promise<void> => {
  const frcValue = await scd30.getForcedRecalibrationValue();

  const output = table([['Forced re-calibration value', `${frcValue} ppm`]]);

  print(output);
};

export const setTempOffsetAction = async (scd30: SCD30, offsetString: string): Promise<void> => {
  const offset = offsetString ? parseInt(offsetString) : 0;

  if (isNaN(offset)) {
    error('Invalid value provided for temperature offset. Must be an integer.');
    return;
  }

  await scd30.setTemperatureOffset(offset);

  print(`Temperature offset set to ${offset}°C`);
};

export const getTempOffsetAction = async (scd30: SCD30): Promise<void> => {
  const offset = await scd30.getTemperatureOffset();

  const output = table([['Temperature offset', `${offset}°C`]]);

  print(output);
};

export const setAltitudeCompensationAction = async (scd30: SCD30, altitudeString: string): Promise<void> => {
  const altitude = altitudeString ? parseInt(altitudeString) : 0;

  if (isNaN(altitude)) {
    error('Invalid value provided for altitude. Must be an integer.');
    return;
  }

  await scd30.setAltitudeCompensation(altitude);

  print(`Altitude set to ${altitude} meters above sea level.`);
};

export const getAltitudeCompensationAction = async (scd30: SCD30): Promise<void> => {
  const offset = await scd30.getAltitudeCompensation();

  const output = table([['Altitude', `${offset} meters above sea level`]]);

  print(output);
};

export const getFirmwareVersionAction = async (scd30: SCD30): Promise<void> => {
  const version = await scd30.getFirmwareVersion();

  const output = table([['Firmware version', `${version}`]]);

  print(output);
};

export const softResetAction = async (scd30: SCD30): Promise<void> => {
  await scd30.softReset();

  print('Soft reset performed.');
};

export const statusAction = async (scd30: SCD30): Promise<void> => {
  const ready = await scd30.isDataReady();
  const interval = await scd30.getMeasurementInterval();
  const ascActive = await scd30.isAutomaticSelfCalibrationActive();
  const frcValue = await scd30.getForcedRecalibrationValue();
  const tempOffset = await scd30.getTemperatureOffset();
  const altComp = await scd30.getAltitudeCompensation();
  const fwVersion = await scd30.getFirmwareVersion();

  const output = table([
    ['Data ready', ready ? 'Yes' : 'No'],
    ['Continuous measurement interval', `${interval} seconds`],
    ['ASC active', ascActive ? 'Yes' : 'No'],
    ['Reference CO2 concentration for FRC', `${frcValue} ppm`],
    ['Temperature offset', `${tempOffset}°C`],
    ['Altitude compensation', `${altComp} meters above sea level`],
    ['Firmware version', fwVersion]
  ]);

  print(output);
};
