import program from 'commander';

import {SCD30} from './scd30';
import {
  isDataReadyAction,
  readMeasurementAction,
  stopContinuousMeasurementAction,
  startContinuousMeasurementAction,
  getMeasurementIntervalAction,
  setMeasurementIntervalAction,
  startAscAction,
  stopAscAction,
  isAscActiveAction,
  setFrcValueAction,
  getFrcValueAction,
  setTempOffsetAction,
  getTempOffsetAction,
  setAltitudeCompensationAction,
  getAltitudeCompensationAction,
  getFirmwareVersionAction,
  softResetAction
} from './cliActions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (...args: any[]) => Promise<void>;

// ugly hack around poor async support in commander
const withBus = (action: Action): Action => async (...args): Promise<void> => {
  const scd30 = await SCD30.connect(program.bus);

  await action(scd30, args);

  await scd30.disconnect();
}

program
  .name('scd30-cli')
  .option(
    '-b, --bus <number>',
    'The number of the I2C bus to open.\n' +
    '0 for /dev/i2c-0, 1 for /dev/i2c-1, ...',
    parseInt,
    1
  );

program.command('is-data-ready')
  .description('Determines if a measurement can be read from the sensor\'s buffer.')
  .action(withBus(isDataReadyAction));

program.command('read-measurement')
  .description('Read a measurement of CO2 concentration, temperature, and humidity.')
  .action(withBus(readMeasurementAction));

program.command('start-continuous-measurement [pressure]')
  .description('Starts continuous measurement of CO2 concentration, temperature, and humidity.', {
    pressure:
      'Ambient pressure to compensate CO2 measurements, 700–1400 mBar.\n' +
      'Overrides altitude compensation.\n' +
      'Setting to 0 deactivates ambient pressure compensation.\n' +
      'To set new value, re-run start-continuous-measurement.'
  })
  .action(withBus(startContinuousMeasurementAction));

program.command('stop-continuous-measurement')
  .description('Stops continuous measurement of CO2 concentration, temperature, and humidity.')
  .action(withBus(stopContinuousMeasurementAction));

program.command('set-measurement-interval <interval>')
  .description('Sets the interval of continuous measurement.', {
    interval: 'Interval of 2–1800 seconds'
  })
  .action(withBus(setMeasurementIntervalAction));

program.command('get-measurement-interval')
  .description('Returns the interval of continuous measurement.')
  .action(withBus(getMeasurementIntervalAction));

program.command('start-asc')
  .description('Starts the automatic self-calibration.')
  .action(withBus(startAscAction));

program.command('stop-asc')
  .description('Stops the automatic self-calibration.')
  .action(withBus(stopAscAction));

program.command('get-asc-status')
  .description('Returns the status of automatic self-calibration.')
  .action(withBus(isAscActiveAction));

program.command('set-frc-value <co2ppm>')
  .description('Sets the reference CO2 concentration for forced re-calibration.', {
    co2ppm: 'Concentration of CO2, 400-2000 ppm'
  })
  .action(withBus(setFrcValueAction));

program.command('get-frc-value')
  .description('Returns the reference CO2 concentration for forced re-calibration.')
  .action(withBus(getFrcValueAction));

program.command('set-temp-offset <offset>')
  .description('Sets the temperature offset.', {
    offset: 'Temperature offset in units of 0.01°C'
  })
  .action(withBus(setTempOffsetAction));

program.command('get-temp-offset')
  .description('Returns the temperature offset.')
  .action(withBus(getTempOffsetAction));

program.command('set-altitude-compensation <altitude>')
  .description('Sets the altitude compensation value.', {
    altitude: 'Altitude in meters above sea level'
  })
  .action(withBus(setAltitudeCompensationAction));

program.command('get-altitude-compensation')
  .description('Returns the altitude compensation value.')
  .action(withBus(getAltitudeCompensationAction));

program.command('get-firmware-version')
  .description('Returns the firmware version.')
  .action(withBus(getFirmwareVersionAction));

program.command('soft-reset')
  .description('Performs a soft reset.')
  .action(withBus(softResetAction));

if (process.argv.length === 2) {
  program.help();
}

program.parseAsync(process.argv);
