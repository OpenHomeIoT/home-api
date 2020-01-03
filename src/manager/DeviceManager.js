//@ts-check
import DeviceDatabase, { getDeviceDatabaseInstance } from "../db/DeviceDatabase";
import IoTDevice, { iotDeviceFromJson } from "../model/IoTDevice";

let instance = null;

/**
 * Get the DeviceManager instance.
 * @returns {DeviceManager} the DeviceManager instance.
 */
const getDeviceManagerInstance = () => {
  if (instance == null) {
    instance = new DeviceManager(getDeviceDatabaseInstance());
  }
  return instance;
}

class DeviceManager {

  /**
   *
   * @param {DeviceDatabase} deviceDatabase
   */
  constructor(deviceDatabase) {
    this._deviceDatabase = deviceDatabase;

    // binding
    this.addDevice = this.addDevice.bind(this);
    this.getAllDevices = this.getAllDevices.bind(this);
    this.getDeviceByUsn = this.getDeviceByUsn.bind(this);
  }

  /**
   * Add an IoTDevice to the DeviceLedgerDatabase.
   * @param {IoTDevice} device the iot device.
   */
  addDevice(device) {
    return this._deviceDatabase.insert(device.toJson())
      .then(() => console.log(`[DeviceManager] Added device: '${device.toString()}'`));
  }

  /**
   * Get all of the IoTDevices.
   * @returns {Promise<Array<IoTDevice>>} the IoTDevices.
   */
  getAllDevices() {
    return this._deviceDatabase.getAll()
      .then(deviceRecords => {
        const devices = [];
        for (const record of deviceRecords) {
          devices.push(iotDeviceFromJson(record));
        }
        return devices;
      });
  }

  /**
   * Get an IoTDevice by its usn.
   * @param {string} usn the usn of the device.
   * @return {Promise<IoTDevice | null>} the IoTDevice.
   */
  getDeviceByUsn(usn) {
    return this._deviceDatabase.get(usn)
      .then(deviceRec => { return iotDeviceFromJson(deviceRec); });
  }

  /**
   * Update an IoTDevice in the database.
   * @param {IoTDevice} iotDevice this IoTDevice.
   */
  updateDevice(iotDevice) {
    return this._deviceDatabase.update(iotDevice.toJson());
  }
};

export default DeviceManager;
export { getDeviceManagerInstance };
