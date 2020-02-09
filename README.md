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

See `src/scd30.ts`.
