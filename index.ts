import {open, close, isReady, readMeasurement} from './scd30';

(async () => {
  await open();

  await isReady()
  console.log(await readMeasurement());

  await close();
})();