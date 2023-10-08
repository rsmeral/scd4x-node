# scd4x-node

Node.js library for [Sensirion SCD40 and SCD41](https://www.sensirion.com/search/products?q=SCD4x), the CO2, temperature, and humidity sensors.

The library exposes all of the commands supported by the SCD40 and SCD41, as documented in the official [Datasheet](https://sensirion.com/media/documents/48C4B7FB/6426E14D/CD_DS_SCD40_SCD41_Datasheet_D1_052023.pdf).

Uses [i2c-bus](https://github.com/fivdi/i2c-bus) for connection to the sensor.

## Usage

```bash
yarn add scd4x-node
```

```javascript
const {SCD4x} = require('scd4x-node');

(async () => {
  const scd4x = await SCD4x.connect();

  try {
    await scd4x.startPeriodicMeasurement();
    // data is available 5s after starting periodic measurement
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch(e) {
    console.log('Periodic measurement already turned on')
  }

  const measurement = await scd4x.readMeasurement();
  console.log(`CO2 Concentration: ${measurement.co2Concentration} ppm`);
  console.log(`Temperature: ${measurement.temperature} °C`);
  console.log(`Humidity: ${measurement.relativeHumidity} %`);

  await scd4x.disconnect();
})();
```

## API Documentation

### Class `SCD4x`

<!-- API DOC -->
* [connect](#connect)
* [startPeriodicMeasurement](#startPeriodicMeasurement)
* [readMeasurement](#readMeasurement)
* [stopPeriodicMeasurement](#stopPeriodicMeasurement)
* [setTemperatureOffset](#setTemperatureOffset)
* [getTemperatureOffset](#getTemperatureOffset)
* [setSensorAltitude](#setSensorAltitude)
* [getSensorAltitude](#getSensorAltitude)
* [setAmbientPressure](#setAmbientPressure)
* [performForcedRecalibration](#performForcedRecalibration)
* [setAutomaticSelfCalibrationEnabled](#setAutomaticSelfCalibrationEnabled)
* [isAutomaticSelfCalibrationEnabled](#isAutomaticSelfCalibrationEnabled)
* [startLowPowerPeriodicMeasurement](#startLowPowerPeriodicMeasurement)
* [isDataReady](#isDataReady)
* [persistSettings](#persistSettings)
* [getSerialNumber](#getSerialNumber)
* [passesSelfTest](#passesSelfTest)
* [performFactoryReset](#performFactoryReset)
* [reinit](#reinit)
* [measureSingleShot](#measureSingleShot)
* [measureSingleShotRhtOnly](#measureSingleShotRhtOnly)
* [disconnect](#disconnect)


<a name="connect"></a>
#### `public static connect(busNumber: number = DEFAULT_I2C_BUS_NUMBER): Promise<SCD4x>`

Connects to the SCD4x on the given I2C bus.
Default bus number is 1.

<a name="startPeriodicMeasurement"></a>
#### `startPeriodicMeasurement(): Promise<void>`

Start periodic measurement, signal update interval is 5 seconds.

<a name="readMeasurement"></a>
#### `readMeasurement(): Promise<Measurement>`

Read a measurement of CO2 concentration, temperature, and humidity.

<a name="stopPeriodicMeasurement"></a>
#### `stopPeriodicMeasurement(): Promise<void>`

Stops continuous measurement.

<a name="setTemperatureOffset"></a>
#### `setTemperatureOffset(offset: number): Promise<void>`

Set temperature offset to improve accuracy of temperature and relative humidity measurements.
To save the setting permanently, call also `persistSettings`.

<a name="getTemperatureOffset"></a>
#### `getTemperatureOffset(): Promise<number>`

Returns the temperature offset.

<a name="setSensorAltitude"></a>
#### `setSensorAltitude(altitude: number): Promise<void>`

Reading and writing of the sensor altitude must be done while the SCD4x is in idle mode.
Typically, the sensor altitude is set once after device installation.

<a name="getSensorAltitude"></a>
#### `getSensorAltitude(): Promise<number>`

Returns the altitude compensation value in meters.

<a name="setAmbientPressure"></a>
#### `setAmbientPressure(pressure: number): Promise<void>`

Can be sent during periodic measurements to enable continuous pressure compensation.
Overrides any pressure compensation based on sensor altitude.

<a name="performForcedRecalibration"></a>
#### `performForcedRecalibration(co2ppm: number): Promise<number>`

To successfully conduct an accurate forced recalibration, the following steps need to be carried out:
1. Operate the SCD4x in the operation mode later used in normal sensor operation (periodic measurement,
low power periodic measurement or single shot) for > 3 minutes in an environment with homogenous and
constant CO2 concentration.
2. Call `stopPeriodicMeasurement`.
3. Call `performForcedRecalibration` and optionally read out the FRC correction (i.e. the magnitude of
the correction).

<a name="setAutomaticSelfCalibrationEnabled"></a>
#### `setAutomaticSelfCalibrationEnabled(enable: boolean): Promise<void>`

Activates or deactivates automatic self-calibration.

<a name="isAutomaticSelfCalibrationEnabled"></a>
#### `isAutomaticSelfCalibrationEnabled(): Promise<boolean>`

Indicates whether automatic self-calibration is active.

<a name="startLowPowerPeriodicMeasurement"></a>
#### `startLowPowerPeriodicMeasurement(): Promise<void>`

Start low power periodic measurement.
Signal update interval is approximately 30 seconds.

<a name="isDataReady"></a>
#### `isDataReady(): Promise<boolean>`

Indicates whether a measurement can be read from the sensor's buffer.

<a name="persistSettings"></a>
#### `persistSettings(): Promise<void>`

Stores current configuration in the EEPROM of the SCD4x, making it persistent across power-cycling.

<a name="getSerialNumber"></a>
#### `getSerialNumber(): Promise<number>`

Returns the unique 48-bit serial number identifying the chip and verifying the presence of the sensor.

<a name="passesSelfTest"></a>
#### `passesSelfTest(): Promise<boolean>`

Performs a self test to check sensor functionality.

<a name="performFactoryReset"></a>
#### `performFactoryReset(): Promise<void>`

Resets all configuration settings stored in the EEPROM and erases the FRC and ASC algorithm history.

<a name="reinit"></a>
#### `reinit(): Promise<void>`

Reinitializes the sensor by reloading user settings from EEPROM.

<a name="measureSingleShot"></a>
#### `measureSingleShot(): Promise<void>`

Perform an on-demand measurement of CO2 concentration, relative humidity and temperature.

<a name="measureSingleShotRhtOnly"></a>
#### `measureSingleShotRhtOnly(): Promise<void>`

Perform an on-demand measurement of relative humidity and temperature only.
CO2 output is returned as 0 ppm.

<a name="disconnect"></a>
#### `disconnect(): Promise<void>`

Close the I2C bus.

<!-- END API DOC -->
