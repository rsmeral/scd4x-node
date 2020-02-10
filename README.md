# scd30-node

Node.js library for [Sensirion SCD30](
https://www.sensirion.com/en/environmental-sensors/carbon-dioxide-sensors/carbon-dioxide-sensors-co2/), the CO2, temperature, and humidity sensor.

The library exposes all of the commands supported by the SCD30, as documented in the official [Interface Description](https://www.sensirion.com/fileadmin/user_upload/customers/sensirion/Dokumente/9.5_CO2/Sensirion_CO2_Sensors_SCD30_Interface_Description.pdf).

Uses [i2c-bus](https://github.com/fivdi/i2c-bus) for connection to the SCD30.

## Usage

```bash
yarn add scd30-node
```

```typescript
import {SCD30} from 'scd30-node';

// ...

const scd30 = await SCD30.connect();
await scd30.startContinuousMeasurement();

const measurement = await scd30.readMeasurement();
console.log(measurement.co2Concentration);
console.log(measurement.temperature);
console.log(measurement.relativeHumidity);

await scd30.disconnect();
```

## API Documentation

### Class `SCD30`

<!-- API DOC -->
* [connect](#connect)
* [isDataReady](#isDataReady)
* [readMeasurement](#readMeasurement)
* [startContinuousMeasurement](#startContinuousMeasurement)
* [stopContinuousMeasurement](#stopContinuousMeasurement)
* [getMeasurementInterval](#getMeasurementInterval)
* [setMeasurementInterval](#setMeasurementInterval)
* [setAutomaticSelfCalibration](#setAutomaticSelfCalibration)
* [isAutomaticSelfCalibrationActive](#isAutomaticSelfCalibrationActive)
* [setForcedRecalibrationValue](#setForcedRecalibrationValue)
* [getForcedRecalibrationValue](#getForcedRecalibrationValue)
* [setTemperatureOffset](#setTemperatureOffset)
* [getTemperatureOffset](#getTemperatureOffset)
* [setAltitudeCompensation](#setAltitudeCompensation)
* [getAltitudeCompensation](#getAltitudeCompensation)
* [getFirmwareVersion](#getFirmwareVersion)
* [softReset](#softReset)
* [disconnect](#disconnect)


<a name="connect"></a>
#### `public static connect(): Promise<SCD30>`

Connects to the SCD30 on the given I2C bus.

<a name="isDataReady"></a>
#### `isDataReady(): Promise<boolean>`

Used to determine if a measurement can be read from the sensor's buffer.
Whenever there is a measurement available from the internal buffer this function returns true, and false otherwise.
As soon as the measurement has been read, the return value changes to false.
It is recommended to call this function before calling `readMeasurement`.

<a name="readMeasurement"></a>
#### `readMeasurement(): Promise<Measurement>`

Read a measurement of CO2 concentration, temperature, and humidity.
Returns the measurement as an object:
```typescript
{
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
}
```

<a name="startContinuousMeasurement"></a>
#### `startContinuousMeasurement(): Promise<void>`

Starts continuous measurement of CO2 concentration, temperature, and humidity.
Measurement data which is not read from the sensor will be overwritten.
The measurement interval is adjustable via `setMeasurementInterval`, initial measurement rate is 2s.

<a name="stopContinuousMeasurement"></a>
#### `stopContinuousMeasurement(): Promise<void>`

Stops continuous measurement.

<a name="getMeasurementInterval"></a>
#### `getMeasurementInterval(): Promise<number>`

Returns current interval of continuous measurement.

<a name="setMeasurementInterval"></a>
#### `setMeasurementInterval(): Promise<void>`

Sets the interval of continuous measurement.
Initial value is 2s. The chosen measurement interval is saved in non-volatile memory and thus is not reset
to its initial value after power up.

<a name="setAutomaticSelfCalibration"></a>
#### `setAutomaticSelfCalibration(): Promise<void>`

Activates or deactivates automatic self-calibration.

<a name="isAutomaticSelfCalibrationActive"></a>
#### `isAutomaticSelfCalibrationActive(): Promise<boolean>`

Indicates whether automatic self-calibration is active.

<a name="setForcedRecalibrationValue"></a>
#### `setForcedRecalibrationValue(): Promise<void>`

Forced recalibration (FRC) is used to compensate for sensor drifts when a reference value of CO2 concentration in
close proximity to the SCD30 is available. For best results, the sensor has to be run in a stable environment in
continuous mode at a measurement rate of 2s for at least two minutes before applying the FRC command and sending
the reference value.

<a name="getForcedRecalibrationValue"></a>
#### `getForcedRecalibrationValue(): Promise<number>`

Returns the most recently used reference value of FRC.
After repowering the sensor, the command will return the standard reference value of 400 ppm.

<a name="setTemperatureOffset"></a>
#### `setTemperatureOffset(): Promise<void>`

The on-board RH/T sensor is influenced by thermal self-heating of SCD30 and other electrical components. Design-in
alters the thermal properties of SCD30 such that temperature and humidity offsets may occur when operating the
sensor in end-customer devices. Compensation of those effects is achievable by writing the temperature offset found
in continuous operation of the device into the sensor.

<a name="getTemperatureOffset"></a>
#### `getTemperatureOffset(): Promise<number>`

Returns the temperature offset.

<a name="setAltitudeCompensation"></a>
#### `setAltitudeCompensation(): Promise<void>`

Measurements of CO2 concentration based on the NDIR principle are influenced by altitude. SCD30 can compensate
deviations due to altitude. Setting altitude is disregarded when an ambient pressure was provided in
`startContinuousMeasurement`.

<a name="getAltitudeCompensation"></a>
#### `getAltitudeCompensation(): Promise<number>`

Returns the altitude compensation value in meters.

<a name="getFirmwareVersion"></a>
#### `getFirmwareVersion(): Promise<string>`

Returns the firmware version of SCD30.

<a name="softReset"></a>
#### `softReset(): Promise<void>`

Perform soft reset.

<a name="disconnect"></a>
#### `disconnect(): Promise<void>`

Close the I2C bus.

<!-- END API DOC -->
