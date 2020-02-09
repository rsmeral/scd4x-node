import program from 'commander';

import {open} from './scd30';
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

program.name('scd30-cli');

program.command('is-data-ready')
  .description('Determines if a measurement can be read from the sensor\'s buffer.')
  .action(isDataReadyAction);

program.command('read-measurement')
  .description('Read a measurement of CO2 concentration, temperature, and humidity.')
  .action(readMeasurementAction);

program.command('start-continuous-measurement [pressure]')
  .description('Starts continuous measurement of CO2 concentration, temperature, and humidity.', {
    pressure:
      'Ambient pressure to compensate CO2 measurements, 700–1400 mBar.\n' +
      'Overrides altitude compensation.\n' +
      'Setting to 0 deactivates ambient pressure compensation.\n' +
      'To set new value, re-run start-continuous-measurement.'
  })
  .action(startContinuousMeasurementAction);

program.command('stop-continuous-measurement')
  .description('Stops continuous measurement of CO2 concentration, temperature, and humidity.')
  .action(stopContinuousMeasurementAction);

program.command('set-measurement-interval <interval>')
  .description('Sets the interval of continuous measurement.', {
    interval: 'Interval of 2–1800 seconds'
  })
  .action(setMeasurementIntervalAction);

program.command('get-measurement-interval')
  .description('Returns the interval of continuous measurement.')
  .action(getMeasurementIntervalAction);

program.command('start-asc')
  .description('Starts the automatic self-calibration.')
  .action(startAscAction);

program.command('stop-asc')
  .description('Stops the automatic self-calibration.')
  .action(stopAscAction);

program.command('get-asc-status')
  .description('Returns the status of automatic self-calibration.')
  .action(isAscActiveAction);

program.command('set-frc-value <co2ppm>')
  .description('Sets the reference CO2 concentration for forced re-calibration.', {
    co2ppm: 'Concentration of CO2, 400-2000 ppm'
  })
  .action(setFrcValueAction);

program.command('get-frc-value')
  .description('Returns the reference CO2 concentration for forced re-calibration.')
  .action(getFrcValueAction);

program.command('set-temp-offset <offset>')
  .description('Sets the temperature offset.', {
    offset: 'Temperature offset in units of 0.01°C'
  })
  .action(setTempOffsetAction);

program.command('get-temp-offset')
  .description('Returns the temperature offset.')
  .action(getTempOffsetAction);

program.command('set-altitude-compensation <altitude>')
  .description('Sets the altitude compensation value.', {
    altitude: 'Altitude in meters above sea level'
  })
  .action(setAltitudeCompensationAction);

program.command('get-altitude-compensation')
  .description('Returns the altitude compensation value.')
  .action(getAltitudeCompensationAction);

program.command('get-firmware-version')
  .description('Returns the firmware version.')
  .action(getFirmwareVersionAction);

program.command('soft-reset')
  .description('Performs a soft reset.')
  .action(softResetAction);

if (process.argv.length === 2) {
  program.help();
}

(async (): Promise<void> => {
  const bus = await open();

  await program.parseAsync(process.argv);

  await bus.close();
})();
