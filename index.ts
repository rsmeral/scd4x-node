import {open, close, isDataReady, readMeasurement} from './scd30';

(async (): Promise<void> => {
  await open();

  await isDataReady();
  console.log(await readMeasurement());

  await close();
})();
