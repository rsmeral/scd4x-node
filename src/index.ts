import {openPromisified, PromisifiedBus} from 'i2c-bus';

import {performCommand, performCommandAndRead, integerToUint16, booleanToUint16} from './util';

import {
  SCD30_CMD_GET_DATA_READY,
  SCD30_CMD_READ_MEASUREMENT,
  SCD30_CMD_START_PERIODIC_MEASUREMENT,
  SCD30_CMD_STOP_PERIODIC_MEASUREMENT,
  SCD30_CMD_SET_MEASUREMENT_INTERVAL,
  SCD30_CMD_AUTO_SELF_CALIBRATION,
  SCD30_CMD_SET_FORCED_RECALIBRATION,
  SCD30_CMD_SET_TEMPERATURE_OFFSET,
  SCD30_CMD_SET_ALTITUDE,
  SCD30_CMD_READ_FIRMWARE_VERSION,
  SCD30_CMD_SOFT_RESET
} from './constants';

const DEFAULT_I2C_BUS_NUMBER = 1;

type Measurement = {
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
};

export class SCD30 {
  /**
   * Connects to the SCD30 on the given I2C bus.
   */
  public static connect = async (busNumber: number = DEFAULT_I2C_BUS_NUMBER): Promise<SCD30> => {
    const bus = await openPromisified(busNumber);

    return new SCD30(bus);
  };

  private constructor(private bus: PromisifiedBus) {}

  /**
   * Used to determine if a measurement can be read from the sensor's buffer.
   * Whenever there is a measurement available from the internal buffer this function returns true, and false otherwise.
   * As soon as the measurement has been read, the return value changes to false.
   * It is recommended to call this function before calling `readMeasurement`.
   */
  isDataReady = async (): Promise<boolean> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_GET_DATA_READY, 3);

    const result = response.readUInt16BE(0);

    return result === 1;
  };

  /**
   * Read a measurement of CO2 concentration, temperature, and humidity.
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
    const response = await performCommandAndRead(this.bus, SCD30_CMD_READ_MEASUREMENT, 18);

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
   * @param pressure Ambient pressure in mBar. Must be a value between 700 and 1400, inclusive.
   */
  startContinuousMeasurement = async (pressure = 0): Promise<void> => {
    if (pressure !== 0 && (pressure < 700 || pressure > 1400)) {
      throw new Error('Pressure out of range. Must be either 0, or between 700 and 1400, inclusive.');
    }

    await performCommand(this.bus, SCD30_CMD_START_PERIODIC_MEASUREMENT, integerToUint16(pressure));
  };

  /**
   * Stops continuous measurement.
   */
  stopContinuousMeasurement = (): Promise<void> => performCommand(this.bus, SCD30_CMD_STOP_PERIODIC_MEASUREMENT);

  /**
   * Returns current interval of continuous measurement.
   */
  getMeasurementInterval = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, 3);

    const measurementInterval = response.readUInt16BE(0);

    return measurementInterval;
  };

  /**
   * Sets the interval of continuous measurement.
   * Initial value is 2s. The chosen measurement interval is saved in non-volatile memory and thus is not reset
   * to its initial value after power up.
   *
   * @param interval Measurement interval in seconds. Must be a value between 2 and 1800, inclusive.
   */
  setMeasurementInterval = async (interval: number): Promise<void> => {
    if (interval < 2 || interval > 1800) {
      throw new Error('Measurement interval out of range. Must be between 2 and 1800, inclusive.');
    }

    await performCommand(this.bus, SCD30_CMD_SET_MEASUREMENT_INTERVAL, integerToUint16(interval));
  };

  /**
   * Activates or deactivates automatic self-calibration.
   *
   * When activated for the first time, a period of 7 days is needed for the algorithm to find its initial parameters.
   * The sensor has to be exposed to fresh air for at least 1 hour every day. Also during that period, the sensor may
   * not be disconnected from power supply, otherwise the procedure is aborted.
   *
   * The successfully calculated parameters are stored in non-volatile memory and thus not reset after power up.
   * The most recently found self-calibration parameters will be actively used for selfcalibration disregarding
   * the status of this feature. Finding a new parameter set by the here described method will always overwrite the
   * settings from external recalibration (see chapter 0) and vice-versa. The feature is switched off by default.
   *
   * To work properly, SCD30 has to see fresh air on a regular basis. Optimal working conditions are given when the
   * sensor sees fresh air for one hour every day so that ASC can constantly re-calibrate. ASC only works in continuous
   * measurement mode. ASC status is saved in non-volatile memory. When the sensor is powered down while ASC is
   * activated, SCD30 will continue with automatic self-calibration after repowering.
   *
   * @param enable Set to true to enable, or to false to disable ASC
   */
  setAutomaticSelfCalibration = async (enable?: boolean): Promise<void> =>
    performCommand(this.bus, SCD30_CMD_AUTO_SELF_CALIBRATION, booleanToUint16(enable));

  /**
   * Indicates whether automatic self-calibration is active.
   */
  isAutomaticSelfCalibrationActive = async (): Promise<boolean> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_AUTO_SELF_CALIBRATION, 3);

    const result = response.readUInt16BE(0);

    return result === 1;
  };

  /**
   * Forced recalibration (FRC) is used to compensate for sensor drifts when a reference value of CO2 concentration in
   * close proximity to the SCD30 is available. For best results, the sensor has to be run in a stable environment in
   * continuous mode at a measurement rate of 2s for at least two minutes before applying the FRC command and sending
   * the reference value.
   *
   * The FRC supersedes the automatic self-calibration and vice-versa. The FRC method imposes a permanent update of the
   * CO2 calibration curve which persists after repowering the sensor. The most recently used reference value is
   * retained in volatile memory and can be read out with `getForcedRecalibrationValue`.
   *
   * @param co2ppm Reference CO2 concentration. Value must be between 400 ppm and 2000 ppm, inclusive.
   */
  setForcedRecalibrationValue = async (co2ppm: number): Promise<void> => {
    if (co2ppm < 400 || co2ppm > 2000) {
      throw new Error('Reference CO2 concentration out of range. Must be between 400 and 2000, inclusive.');
    }

    await performCommand(this.bus, SCD30_CMD_SET_FORCED_RECALIBRATION, integerToUint16(co2ppm));
  };

  /**
   * Returns the most recently used reference value of FRC.
   * After repowering the sensor, the command will return the standard reference value of 400 ppm.
   */
  getForcedRecalibrationValue = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_SET_FORCED_RECALIBRATION, 3);

    const result = response.readUInt16BE(0);

    return result;
  };

  /**
   * The on-board RH/T sensor is influenced by thermal self-heating of SCD30 and other electrical components. Design-in
   * alters the thermal properties of SCD30 such that temperature and humidity offsets may occur when operating the
   * sensor in end-customer devices. Compensation of those effects is achievable by writing the temperature offset found
   * in continuous operation of the device into the sensor.
   *
   * Temperature offset value is saved in non-volatile memory, and thus will be used for temperature offset compensation
   * even after repowering.
   *
   * @param offset Temperature offset, unit [°C x 100], i.e. one tick corresponds to 0.01°C.
   */
  setTemperatureOffset = async (offset: number): Promise<void> =>
    performCommand(this.bus, SCD30_CMD_SET_TEMPERATURE_OFFSET, integerToUint16(offset));

  /**
   * Returns the temperature offset.
   */
  getTemperatureOffset = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_SET_TEMPERATURE_OFFSET, 3);

    const result = response.readUInt16BE(0);

    return result;
  };

  /**
   * Measurements of CO2 concentration based on the NDIR principle are influenced by altitude. SCD30 can compensate
   * deviations due to altitude. Setting altitude is disregarded when an ambient pressure was provided in
   * `startContinuousMeasurement`.
   *
   * Altitude value is saved in non-volatile memory, and thus will be used for altitude compensation even after
   * repowering.
   *
   * @param altitude Height over sea level in meters above 0.
   */
  setAltitudeCompensation = async (altitude: number): Promise<void> =>
    performCommand(this.bus, SCD30_CMD_SET_ALTITUDE, integerToUint16(altitude));

  /**
   * Returns the altitude compensation value in meters.
   */
  getAltitudeCompensation = async (): Promise<number> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_SET_ALTITUDE, 3);

    const result = response.readUInt16BE(0);

    return result;
  };

  /**
   * Returns the firmware version of SCD30.
   */
  getFirmwareVersion = async (): Promise<string> => {
    const response = await performCommandAndRead(this.bus, SCD30_CMD_READ_FIRMWARE_VERSION, 3);

    const major = response.readUInt8(0);
    const minor = response.readUInt8(1);

    return `${major}.${minor}`;
  };

  /**
   * Perform soft reset.
   *
   * The SCD30 provides a soft reset mechanism that forces the sensor into the same state as after powering up without
   * the need for removing the power-supply. It does so by restarting its system controller. After soft reset the sensor
   * will reload all calibrated data. However, it is worth noting that the sensor reloads calibration data prior to
   * every measurement by default. This includes previously set reference values from ASC or FRC as well as temperature
   * offset values last setting.
   *
   * The sensor is able to receive the command at any time, regardless of its internal state.
   */
  softReset = (): Promise<void> => performCommand(this.bus, SCD30_CMD_SOFT_RESET);

  /**
   * Close the I2C bus.
   */
  disconnect = (): Promise<void> => this.bus.close();
}
