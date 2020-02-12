// Type definitions for i2c-bus v5.1.0
// Project: https://github.com/fivdi/i2c-bus
// Definitions by: Jason Heard <https://github.com/101100>
//                 Ron Smeral <https://github.com/rsmeral>

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'i2c-bus' {
  interface CompletionCallback {
    (error: any): void;
  }

  interface BufferCallback {
    (error: any, bytesReadOrWritten: number, buffer: Buffer): void;
  }

  interface ResultCallback<T> {
    (error: any, result: T): void;
  }

  class I2cFuncs {
    i2c: boolean;
    tenBitAddr: boolean;
    protocolMangling: boolean;
    smbusPec: boolean;
    smbusBlockProcCall: boolean;
    smbusQuick: boolean;
    smbusReceiveByte: boolean;
    smbusSendByte: boolean;
    smbusReadByte: boolean;
    smbusWriteByte: boolean;
    smbusReadWord: boolean;
    smbusWriteWord: boolean;
    smbusProcCall: boolean;
    smbusReadBlock: boolean;
    smbusWriteBlock: boolean;
    smbusReadI2cBlock: boolean;
    smbusWriteI2cBlock: boolean;
  }

  interface BusOptions {
    /**
     * A boolean value specifying whether access to devices on the I2C bus should be allowed even if they are already in use by a kernel driver/module.
     * Corresponds to I2C_SLAVE_FORCE on Linux.
     */
    forceAccess: boolean;
  }

  interface DeviceId {
    manufacturer: number;
    product: number;
    name: string;
  }

  interface BusReadResult {
    bytesRead: number;
    buffer: Buffer;
  }

  interface BusWriteResult {
    bytesWritten: number;
    buffer: Buffer;
  }

  class Bus {
    /**
     * Return the PromisifiedBus instance for this Bus instance.
     */
    promisifiedBus(): PromisifiedBus;

    /**
     * Asynchronous close.
     *
     * @param {CompletionCallback} callback Completion callback
     */
    close(callback: CompletionCallback): void;

    /**
     * Synchronous close.
     */
    closeSync(): void;

    /**
     * Determine functionality of the bus/adapter asynchronously.
     *
     * @param {ResultCallback<I2cFuncs>} callback Callback that will recieve a frozen I2cFuncs object describing the I2C functionality available.
     */
    i2cFuncs(callback: ResultCallback<I2cFuncs>): void;

    /**
     * Determine functionality of the bus/adapter synchronously.
     *
     * @returns {I2cFuncs} A frozen I2cFuncs object describing the I2C functionality available.
     */
    i2cFuncsSync(): I2cFuncs;

    /**
     * Asynchronous SMBus read byte.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {ResultCallback<number>} callback Callback that will recieve the byte read.
     */
    readByte(address: number, command: number, callback: ResultCallback<number>): void;

    /**
     * Synchronous SMBus read byte.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @returns {number} The byte read.
     */
    readByteSync(address: number, command: number): number;

    /**
     * Asynchronous SMBus read word.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {ResultCallback<number>} callback Callback that will recieve the word read.
     */
    readWord(address: number, command: number, callback: ResultCallback<number>): void;

    /**
     * Synchronous SMBus read word.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @returns {number} The word read.
     */
    readWordSync(address: number, command: number): number;

    /**
     * Asynchronous I2C block read (not defined by the SMBus
     * specification). Reads a block of bytes from a device, from a
     * designated register that is specified by cmd.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} length The number of bytes to read (max 32).
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least {length} bytes long).
     * @param {BufferCallback} callback Callback that will recieve the number of bytes read and the given buffer.
     */
    readI2cBlock(address: number, command: number, length: number, buffer: Buffer, callback: BufferCallback): void;

    /**
     * Synchronous I2C block read (not defined by the SMBus
     * specification). Reads a block of bytes from a device, from a
     * designated register that is specified by cmd.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} length The number of bytes to read (max 32).
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least {length} bytes long).
     * @returns {number} The number of bytes read.
     */
    readI2cBlockSync(address: number, command: number, length: number, buffer: Buffer): number;

    /**
     * Asynchronous SMBus receive byte.
     *
     * @param {number} address I2C device address.
     * @param {ResultCallback<number>} callback Callback that will recieve the byte received.
     */
    receiveByte(address: number, callback: ResultCallback<number>): void;

    /**
     * Synchronous SMBus receive byte.
     *
     * @param {number} address I2C device address.
     * @returns {number} The byte received.
     */
    receiveByteSync(address: number): number;

    /**
     * Asynchronous SMBus send byte.
     *
     * @param {number} address I2C device address.
     * @param {number} byte The data byte to send.
     * @param {CompletionCallback} callback Completion callback
     */
    sendByte(address: number, byte: number, callback: CompletionCallback): void;

    /**
     * Synchronous SMBus send byte.
     *
     * @param {number} address I2C device address.
     * @param {number} byte The data byte to send.
     */
    sendByteSync(address: number, byte: number): void;

    /**
     * Asynchronous SMBus write byte.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} byte The data byte to write.
     * @param {CompletionCallback} callback Completion callback
     */
    writeByte(address: number, command: number, byte: number, callback: CompletionCallback): void;

    /**
     * Synchronous SMBus write byte.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} byte The data byte to write.
     */
    writeByteSync(address: number, command: number, byte: number): void;

    /**
     * Asynchronous SMBus write word.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} word The data word to write.
     * @param {CompletionCallback} callback Completion callback
     */
    writeWord(address: number, command: number, word: number, callback: CompletionCallback): void;

    /**
     * Synchronous SMBus write word.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} word The data word to write.
     */
    writeWordSync(address: number, command: number, word: number): void;

    /**
     * Asynchronous SMBus quick command.  Writes a single bit to the device.
     *
     * @param {number} address I2C device address.
     * @param {number} bit The data bit to write (0 or 1).
     * @param {CompletionCallback} callback Completion callback
     */
    writeQuick(address: number, command: number, bit: number, callback: CompletionCallback): void;

    /**
     * Synchronous SMBus quick command.  Writes a single bit to the device.
     *
     * @param {number} address I2C device address.
     * @param {number} bit The data bit to write (0 or 1).
     */
    writeQuickSync(address: number, command: number, bit: number): void;

    /**
     * Asynchronous I2C block write (not defined by the SMBus
     * specification). Writes a block of bytes to a device, to a designated
     * register that is specified by {command}.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} length The number of bytes to write (max 32).
     * @param {Buffer} buffer The buffer that the data to write (must contain at least {length} bytes).
     * @param {BufferCallback} callback Callback that will recieve the number of bytes written and the given buffer.
     */
    writeI2cBlock(address: number, command: number, length: number, buffer: Buffer, callback: BufferCallback): void;

    /**
     * Synchronous I2C block write (not defined by the SMBus
     * specification). Writes a block of bytes to a device, to a designated
     * register that is specified by {command}.
     *
     * @param {number} address I2C device address.
     * @param {number} command The command code.
     * @param {number} length The number of bytes to write (max 32).
     * @param {Buffer} buffer The buffer that the data will to write (must contain at least {length} bytes).
     * @returns {number} The number of bytes written.
     */
    writeI2cBlockSync(address: number, command: number, length: number, buffer: Buffer): number;

    /**
     * Asynchronous plain I2C read.
     *
     * @param {number} address I2C device address.
     * @param {number} length The number of bytes to read.
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least {length} bytes long).
     * @param {BufferCallback} callback Callback that will recieve the number of bytes read and the given buffer.
     */
    i2cRead(address: number, length: number, buffer: Buffer, callback: BufferCallback): void;

    /**
     * Synchronous plain I2C read.
     *
     * @param {number} address I2C device address.
     * @param {number} length The number of bytes to read.
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least {length} bytes long).
     * @returns {number} The number of bytes read.
     */
    i2cReadSync(address: number, length: number, buffer: Buffer): number;

    /**
     * Asynchronous plain I2C write.
     *
     * @param {number} address I2C device address.
     * @param {number} length The number of bytes to write.
     * @param {Buffer} buffer The buffer that the data to write (must contain at least {length} bytes).
     * @param {BufferCallback} callback Callback that will recieve the number of bytes written and the given buffer.
     */
    i2cWrite(address: number, length: number, buffer: Buffer, callback: BufferCallback): void;

    /**
     * Synchronous plain I2C write.
     *
     * @param {number} address I2C device address.
     * @param {number} length The number of bytes to write.
     * @param {Buffer} buffer The buffer that the data will to write (must contain at least {length} bytes).
     * @returns {number} The number of bytes written.
     */
    i2cWriteSync(address: number, length: number, buffer: Buffer): number;

    /**
     * Scans the I2C bus asynchronously for devices.
     * The default address range 0x03 through 0x77 is the same as the default address range used by the `i2cdetect`
     * command line tool.
     *
     * @param {ResultCallback<number[]>} callback Callback that will recieve an array of I2C addresses of detected devices.
     */
    scan(callback: ResultCallback<number[]>): void;

    /**
     * Scans the I2C bus asynchronously for devices.
     * The default address range 0x03 through 0x77 is the same as the default address range used by the `i2cdetect`
     * command line tool.
     *
     * @param {number} startAddr An integer specifying the start address of the scan range
     * @param {ResultCallback<number[]>} callback Callback that will recieve an array of I2C addresses of detected devices.
     */
    scan(startAddr: number, callback: ResultCallback<number[]>): void;

    /**
     * Scans the I2C bus asynchronously for devices.
     * The default address range 0x03 through 0x77 is the same as the default address range used by the `i2cdetect`
     * command line tool.
     *
     * @param {number} startAddr An integer specifying the start address of the scan range
     * @param {number} endAddr An integer specifying the end addrerss of the scan range
     * @param {ResultCallback<number[]>} callback Callback that will recieve an array of I2C addresses of detected devices.
     */
    scan(startAddr: number, endAddr: number, callback: ResultCallback<number[]>): void;

    /**
     * Scans the I2C bus synchronously for devices.
     * The default address range 0x03 through 0x77 is the same as the default address range used by the `i2cdetect`
     * command line tool.
     *
     * @param {number} startAddr An integer specifying the start address of the scan range
     * @param {number} endAddr An integer specifying the end addrerss of the scan range
     * @returns {number[]} An array of I2C addresses of detected devices.
     */
    scanSync(startAddr?: number, endAddr?: number): number[];

    /**
     * Asynchronous I2C device Id.
     *
     * @param addr I2C device address
     * @param cb Callback that will recieve the DeviceId
     */
    deviceId(addr: number, cb: ResultCallback<DeviceId>);

    /**
     * Synchronous I2C device Id.
     *
     * @param addr I2C device address
     * @returns The DeviceId
     */
    deviceIdSync(addr: number): DeviceId;
  }

  class PromisifiedBus {
    /**
     * Return the Bus instance for this PromisifiedBus instance.
     */
    bus(): Bus;

    /**
     * Asynchronous close.
     *
     * @returns A Promise resolved once the underlying resources have been released, or rejected if an error occurs while closing.
     */
    close(): Promise<void>;

    /**
     * Determine functionality of the bus/adapter asynchronously.
     *
     * @returns A Promise resolved with a frozen I2cFuncs object describing the functionality available, or rejected if an error occurs. See also [I2C functionality](https://www.kernel.org/doc/Documentation/i2c/functionality).
     */
    i2cFuncs(): Promise<I2cFuncs>;

    /**
     * Asynchronous SMBus read byte.
     *
     * @param addr I2C device address
     * @param cmd Command code
     * @returns A Promise resolved with a number representing the byte read on success, or rejected if an error occurs. byte is an unsigned integer in the range 0 to 255.
     */
    readByte(addr: number, cmd: number): Promise<number>;

    /**
     * Asynchronous SMBus read word.
     *
     * @param addr I2C device address
     * @param cmd Command code
     * @returns A Promise resolved with a number representing the word read on success, or rejected if an error occurs. word is an unsigned integer in the range 0 to 65535.
     */
    readWord(addr: number, cmd: number): Promise<number>;

    /**
     * Asynchronous I2C block read (not defined by the SMBus specification).
     * Reads a block of bytes from a device, from a designated register that is specified by cmd.
     *
     * @param {number} addre I2C device address.
     * @param {number} cmd The command code.
     * @param {number} length The number of bytes to read (max 32).
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least `length` bytes long).
     * @returns A Promise resolved with an object with a bytesRead property identifying the number of bytes read, and a buffer property that is a reference to the passed in buffer argument. The returned Promise will be rejected if an error occurs.
     */
    readI2cBlock(addr: number, cmd: number, length: number, buffer: Buffer): Promise<BusReadResult>;

    /**
     * Asynchronous SMBus receive byte.
     *
     * @param addr I2C device address
     * @returns A Promise that will be resolved with a number representing the byte received on success, or will be rejected if an error occurs. byte is an unsigned integer in the range 0 to 255.
     */
    receiveByte(addr: number): Promise<number>;

    /**
     * Asynchronous SMBus send byte.
     *
     * @param {number} addr I2C device address.
     * @param {number} byte The data byte to send.
     * @returns A Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.
     */
    sendByte(addr: number, byte: number): Promise<void>;

    /**
     * Asynchronous SMBus write byte.
     *
     * @param {number} addre I2C device address.
     * @param {number} command The command code.
     * @param {number} byte The data byte to write.
     * @returns A Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.
     */
    writeByte(addr: number, cmd: number, byte: number): Promise<void>;

    /**
     * Asynchronous SMBus write word.
     *
     * @param {number} addre I2C device address.
     * @param {number} command The command code.
     * @param {number} word The data word to write.
     * @returns A Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.
     */
    writeWord(addr: number, cmd: number, word: number): Promise<void>;

    /**
     * Asynchronous SMBus quick command.
     * Writes a single bit to the device.
     *
     * @param {number} addre I2C device address.
     * @param {number} bit The data bit to write (0 or 1).
     * @returns A Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.
     */
    writeQuick(addr: number, bit: number): Promise<void>;

    /**
     * Asynchronous I2C block write (not defined by the SMBus specification).
     * Writes a block of bytes to a device, to a designated register that is specified by cmd.
     *
     * @param {number} addr I2C device address.
     * @param {number} cmd The command code.
     * @param {number} length The number of bytes to write (max 32).
     * @param {Buffer} buffer The buffer that the data to write (must contain at least {length} bytes).
     * @returns A Promise that on success will be resolved with an object with a bytesWritten property identifying the number of bytes written, and a buffer property that is a reference to the passed in buffer argument. The returned promise will be rejected if an error occurs.
     */
    writeI2cBlock(addr: number, cmd: number, length: number, buffer: Buffer): Promise<BusWriteResult>;

    /**
     * Asynchronous plain I2C read.
     *
     * @param {number} addr I2C device address.
     * @param {number} length The number of bytes to read.
     * @param {Buffer} buffer The buffer that the data will be written to (must be at least {length} bytes long).
     * @returns A Promise that on success will be resolved with an object with a bytesRead property identifying the number of bytes read, and a buffer property that is a reference to the passed in buffer argument. The returned Promise will be rejected if an error occurs.
     */
    i2cRead(addr: number, length: number, buffer: Buffer): Promise<BusReadResult>;

    /**
     * Asynchronous plain I2C write.
     *
     * @param {number} addr I2C device address.
     * @param {number} length The number of bytes to write.
     * @param {Buffer} buffer The buffer that the data will to write (must contain at least {length} bytes).
     * @returns A Promise that on success will be resolved with an object with a bytesWritten property identifying the number of bytes written, and a buffer property that is a reference to the passed in buffer argument. The returned promise will be rejected if an error occurs.
     */
    i2cWrite(addr: number, length: number, buffer: Buffer): Promise<BusWriteResult>;

    /**
     * Scans the I2C bus asynchronously for devices.
     * The default address range 0x03 through 0x77 is the same as the default address range used by the `i2cdetect` command line tool.
     *
     * @param {number} startAddr An integer specifying the start address of the scan range
     * @param {number} endAddr An integer specifying the end addrerss of the scan range
     * @returns A Promise that on success will be resolved with an array of numbers where each number represents the I2C address of a device which was detected. The returned Promise will be rejected if an error occurs.
     */
    scan(startAddr: number, endAddr: number): Promise<number[]>;

    /**
     * Asynchronous I2C device Id.
     *
     * @param addr I2C device address
     * @returns A Promise that will be resolved with an id object on success, or will be rejected if an error occurs. id is an object with the properties manufacturer, product and if known a human readable name for the associated manufacturer. manufacturer and product are numbers, name is a string.
     */
    deviceId(addr: number): Promise<DeviceId>;
  }

  /**
   * Asynchronous open.
   *
   * @param {number} busNumber The number of the I2C bus/adapter to open, 0 for `/dev/i2c-0`, 1 for `/dev/i2c-1`, etc.
   * @param {BusOptions} options Bus options
   * @param {CompletionCallback} callback Completion callback
   * @returns {Bus} A new Bus object
   */
  function open(busNumber: number, options: BusOptions, calback: CompletionCallback): Bus;

  /**
   * Asynchronous open.
   *
   * @param  {number} busNumber The number of the I2C bus/adapter to open, 0 for {/dev/i2c-0}, 1 for {/dev/i2c-1}, etc.
   * @param  {CompletionCallback} callback Completion callback
   * @returns {Bus} A new Bus object
   */
  function open(busNumber: number, calback: CompletionCallback): Bus;

  /**
   * Synchronous open.
   *
   * @param {number} busNumber The number of the I2C bus/adapter to open, 0 for `/dev/i2c-0`, 1 for `/dev/i2c-1`, etc.
   * @param {BusOptions} options Bus options
   * @returns {Bus} A new Bus object
   */
  function openSync(busNumber: number, options: BusOptions): Bus;

  /**
   * Synchronous open.
   *
   * @param {number} busNumber The number of the I2C bus/adapter to open, 0 for `/dev/i2c-0`, 1 for `/dev/i2c-1`, etc.
   * @returns {Bus} A new Bus object
   */
  function openSync(busNumber: number): Bus;

  /**
   * Opens a PromisifiedBus.
   *
   * @param {number} busNumber The number of the I2C bus/adapter to open, 0 for `/dev/i2c-0`, 1 for `/dev/i2c-1`, etc.
   * @param {BusOptions} options Bus options
   * @returns {Promise<PromisifiedBus>} A promise of a PromisifiedBus
   */
  function openPromisified(busNumber: number, options: BusOptions): Promise<PromisifiedBus>;

  /**
   * Opens a PromisifiedBus.
   *
   * @param {number} busNumber The number of the I2C bus/adapter to open, 0 for `/dev/i2c-0`, 1 for `/dev/i2c-1`, etc.
   * @returns {Promise<PromisifiedBus>} A promise of a PromisifiedBus
   */
  function openPromisified(busNumber: number): Promise<PromisifiedBus>;
}
