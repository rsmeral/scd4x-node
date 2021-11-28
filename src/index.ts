import {openPromisified, PromisifiedBus} from 'i2c-bus';

import {performCommand, performCommandAndRead, integerToUint16, booleanToUint16} from './util';

import {
  SCD4X_CMD_READ_MEASUREMENT,
  SCD4X_CMD_START_PERIODIC_MEASUREMENT,
  SCD4X_CMD_STOP_PERIODIC_MEASUREMENT,
  SCD4X_CMD_SET_TEMPERATURE_OFFSET,
  SCD4X_CMD_SET_SENSOR_ALTITUDE,
  SCD4X_CMD_GET_SENSOR_ALTITUDE,
  SCD4X_CMD_PERFORM_FORCED_RECALIBRATION,
  SCD4X_CMD_SET_AUTO_SELF_CALIBRATION,
  SCD4X_CMD_GET_AUTO_SELF_CALIBRATION,
  SCD4X_CMD_START_LOW_POWER_PERIODIC_MEASUREMENT,
  SCD4X_CMD_GET_DATA_READY_STATUS,
  SCD4X_CMD_PERSIST_SETTINGS,
  SCD4X_CMD_GET_SERIAL_NUMBER,
  SCD4X_CMD_PERFORM_SELF_TEST,
  SCD4X_CMD_PERFORM_FACTORY_RESET,
  SCD4X_CMD_REINIT,
  SCD4X_CMD_MEASURE_SINGLE_SHOT,
  SCD4X_CMD_MEASURE_SINGLE_SHOT_RHT_ONLY
} from './constants';

const DEFAULT_I2C_BUS_NUMBER = 1;

type Measurement = {
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
};

export class SCD4x {
  /**
   * Connects to the SCD4x on the given I2C bus.
   * Default bus number is 1.
   */
  public static connect = async (busNumber: number = DEFAULT_I2C_BUS_NUMBER): Promise<SCD4x> => {
    const bus = await openPromisified(busNumber);

    return new SCD4x(bus);
  };

  private constructor(private bus: PromisifiedBus) {}

  /**
   * Start periodic measurement, signal update interval is 5 seconds.
   */
  startPeriodicMeasurement = async (): Promise<void> => performCommand(this.bus, SCD4X_CMD_START_PERIODIC_MEASUREMENT);

  /**
   * Read a measurement of CO2 concentration, temperature, and humidity.
   *
   * Returns the measurement as an object:
   * ```typescript
   * {
   *   co2Concentration: number;
   *   temperature: number;
   *   relativeHumidity: number;
   * }
   * ```
   *
   * Make sure to call `isDataReady` before calling this.
   */
  readMeasurement = async (): Promise<Measurement> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_READ_MEASUREMENT, 9, 1);

    const co2Raw = response.readUInt16BE(0);
    const tempRaw = response.readUInt16BE(2);
    const rhRaw = response.readUInt16BE(4);

    return {
      co2Concentration: co2Raw,
      temperature: -45 + (175 * tempRaw) / 2 ** 16,
      relativeHumidity: (100 * rhRaw) / 2 ** 16
    };
  };

  /**
   * Stops continuous measurement.
   *
   * Wait for 500ms after this call before calling other commands.
   */
  stopPeriodicMeasurement = (): Promise<void> => performCommand(this.bus, SCD4X_CMD_STOP_PERIODIC_MEASUREMENT);

  /**
   * Set temperature offset to improve accuracy of temperature and relative humidity measurements.
   * To save the setting permanently, call also `persistSettings`.
   *
   * Setting this has no effect on CO2 measurement accuracy.
   *
   * By default, the temperature offset is 4°C.
   *
   * @param offset Temperature offset in °C.
   */
  setTemperatureOffset = async (offset: number): Promise<void> => {
    const value = Math.round((offset * 2 ** 16) / 175);

    performCommand(this.bus, SCD4X_CMD_SET_TEMPERATURE_OFFSET, integerToUint16(value));
  };

  /**
   * Returns the temperature offset.
   */
  getTemperatureOffset = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_SET_TEMPERATURE_OFFSET, 3, 1);
    const result = response.readUInt16BE(0);

    const decoded = (175 * result) / 2 ** 16;

    return decoded;
  };

  /**
   * Reading and writing of the sensor altitude must be done while the SCD4x is in idle mode.
   * Typically, the sensor altitude is set once after device installation.
   *
   * To save the setting permanently, call also `persistSettings`.
   *
   * By default, the sensor altitude is set to 0 meter above sea-level.
   *
   * @param altitude Height over sea level in meters above 0.
   */
  setSensorAltitude = async (altitude: number): Promise<void> =>
    performCommand(this.bus, SCD4X_CMD_SET_SENSOR_ALTITUDE, integerToUint16(altitude));

  /**
   * Returns the altitude compensation value in meters.
   */
  getSensorAltitude = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_GET_SENSOR_ALTITUDE, 3, 1);

    const result = response.readUInt16BE(0);

    return result;
  };

  /**
   * Can be sent during periodic measurements to enable continuous pressure compensation.
   * Overrides any pressure compensation based on sensor altitude.
   *
   * @param pressure Ambient pressure in Pa.
   */
  setAmbientPressure = async (pressure: number): Promise<void> => {
    const value = Math.round(pressure / 100);
    performCommand(this.bus, SCD4X_CMD_SET_SENSOR_ALTITUDE, integerToUint16(value));
  };

  /**
   * To successfully conduct an accurate forced recalibration, the following steps need to be carried out:
   * 1. Operate the SCD4x in the operation mode later used in normal sensor operation (periodic measurement,
   * low power periodic measurement or single shot) for > 3 minutes in an environment with homogenous and
   * constant CO2 concentration.
   * 2. Call `stopPeriodicMeasurement`.
   * 3. Call `performForcedRecalibration` and optionally read out the FRC correction (i.e. the magnitude of
   * the correction).
   *
   * A return value of `0xffff` indicates that the forced recalibration has failed.
   *
   * @param co2ppm Reference CO2 concentration.
   */
  performForcedRecalibration = async (co2ppm: number): Promise<number> => {
    const response = await performCommandAndRead(
      this.bus,
      SCD4X_CMD_PERFORM_FORCED_RECALIBRATION,
      3,
      400,
      integerToUint16(co2ppm)
    );

    const result = response.readUInt16BE(0);

    if (result === 0xffff) {
      return result;
    }

    return result - 0x8000;
  };

  /**
   * Activates or deactivates automatic self-calibration.
   *
   * To save the setting permanently, call also `persistSettings`.
   *
   * By default, ASC is enabled.
   *
   * @param enable Set to `true` to enable, or to `false` to disable ASC
   */
  setAutomaticSelfCalibrationEnabled = async (enable: boolean): Promise<void> =>
    performCommand(this.bus, SCD4X_CMD_SET_AUTO_SELF_CALIBRATION, booleanToUint16(enable));

  /**
   * Indicates whether automatic self-calibration is active.
   */
  isAutomaticSelfCalibrationEnabled = async (): Promise<boolean> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_GET_AUTO_SELF_CALIBRATION, 3, 1);

    const result = response.readUInt16BE(0);

    return result === 1;
  };

  /**
   * Start low power periodic measurement.
   * Signal update interval is approximately 30 seconds.
   */
  startLowPowerPeriodicMeasurement = async (): Promise<void> =>
    performCommand(this.bus, SCD4X_CMD_START_LOW_POWER_PERIODIC_MEASUREMENT);

  /**
   * Indicates whether a measurement can be read from the sensor's buffer.
   *
   * Call this before calling `readMeasurement` to avoid errors.
   */
  isDataReady = async (): Promise<boolean> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_GET_DATA_READY_STATUS, 3, 1);

    const result = response.readUInt16BE(0);

    return (result & 0x7ff) !== 0;
  };

  /**
   * Stores current configuration in the EEPROM of the SCD4x, making it persistent across power-cycling.
   *
   * Configuration includes temperature offset, sensor altitude and the ASC enabled/disabled parameter.
   *
   * To avoid unnecessary wear of the EEPROM, `persistSettings` should only be called when persistence
   * is required and if actual changes to the configuration have been made.
   */
  persistSettings = async (): Promise<void> => performCommand(this.bus, SCD4X_CMD_PERSIST_SETTINGS);

  /**
   * Returns the unique 48-bit serial number identifying the chip and verifying the presence of the sensor.
   */
  getSerialNumber = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_GET_SERIAL_NUMBER, 9, 1);

    const result = response.readUInt16BE(0) * 2 ** 32 + response.readUInt16BE(2) * 2 ** 16 + response.readUInt16BE(4);

    return result;
  };

  /**
   * Performs a self test to check sensor functionality.
   *
   * @returns `true` if no malfunction detected, `false` otherwise
   */
  passesSelfTest = async (): Promise<boolean> => {
    const response = await performCommandAndRead(this.bus, SCD4X_CMD_PERFORM_SELF_TEST, 3, 10000);

    const result = response.readUInt16BE(0);

    return result === 0;
  };

  /**
   * Resets all configuration settings stored in the EEPROM and erases the FRC and ASC algorithm history.
   */
  performFactoryReset = async (): Promise<void> => performCommand(this.bus, SCD4X_CMD_PERFORM_FACTORY_RESET);

  /**
   * Reinitializes the sensor by reloading user settings from EEPROM.
   *
   * Before calling `reinit`, call `stopPeriodicMeasurement`.
   * If calling `reinit` does not trigger re-initialization, power-cycle the SCD4x.
   */
  reinit = async (): Promise<void> => performCommand(this.bus, SCD4X_CMD_REINIT);

  /**
   * Perform an on-demand measurement of CO2 concentration, relative humidity and temperature.
   *
   * Read the result using `readMeasurement`.
   */
  measureSingleShot = async (): Promise<void> => performCommand(this.bus, SCD4X_CMD_MEASURE_SINGLE_SHOT);

  /**
   * Perform an on-demand measurement of relative humidity and temperature only.
   * CO2 output is returned as 0 ppm.
   *
   * Read the result using `readMeasurement`.
   */
  measureSingleShotRhtOnly = async (): Promise<void> =>
    performCommand(this.bus, SCD4X_CMD_MEASURE_SINGLE_SHOT_RHT_ONLY);

  /**
   * Close the I2C bus.
   */
  disconnect = (): Promise<void> => this.bus.close();
}
