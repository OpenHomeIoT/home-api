import rp from "request-promise";
import { getDeviceDatabaseInstance } from "../../db/DeviceDatabase";

const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;

let instance = null

/**
 * @returns {HomeConfigManager} the instance.
 */
const getHomeConfigManagerInstance = () => {
  if (instance == null) {
    instance = new HomeConfigManager(getDeviceDatabaseInstance());
  }
  return instance;
}

class HomeConfigManager {

  constructor(deviceDatabase) {
    this._deviceDB = deviceDatabase;

    // TODO: binding
    this._checkForDevicesToConfigure = this._checkForDevicesToConfigure.bind(this);
  }

  /**
   * Start looking for devices to configure.
   */
  start() {
    this._configurationTimer = setInterval(() => this._checkForDevicesToConfigure(), 15000);
  }

  /**
   * Stop looking for devices.
   */
  stop() {
    clearInterval(this._configurationTimer);
  }

  /**
   * Set that a device has connected to the hub.
   * @param {string} usn the device's usn.
   */
  setDeviceHasConnected(usn) {
    return this._deviceDB.get(usn)
    .then(iotDevice => {
      iotDevice.status.connectedToHub = true;
      iotDevice.status.lastConnectedToHub = Date.now();
      return this._deviceDB.update(iotDevice);
    });
  }

  /**
   * Set that a device has disconnected from the hub and needs to reconnect.
   * @param {string} usn the device's usn.
   * @returns {Promise<void>}
   */
  setDeviceHasDisconnected(usn) {
    return this._deviceDB.get(usn)
    .then(iotDevice => {
      iotDevice.status.connectedToHub = false;
      iotDevice.status.lastConnectedToHub = Date.now();
      return this._deviceDB.update(iotDevice);
    });
  }

  /**
   * Check to see if there are any devices that are disconnected and attempt to
   * reconnect them to the Hub.
   * @returns {Promise<void[]>}
   */
  _checkForDevicesToConfigure() {
    return this._deviceDB.getAllUnconfiguredForHub()
    .then(unconfigured => Promise.all(unconfigured.map(device => this._configureDeviceForHub(device.network.ipAddress))));
  }

  /**
   * Connect a device to the Home Hub.
   * @param {string} ipAddress the ip address of the device.
   * @returns {Promise<void>}
   */
  _configureDeviceForHub(ipAddress) {
    const request = {
      uri: `http://${ipAddress}/config_parent`,
      body: JSON.stringify({
        parent: {
          address: ADDRESS,
          port: PORT
        }
      }),
      method: "POST"
    };
    return rp(request)
    .then(body => {});
  }
}

export default HomeConfigManager;
export { getHomeConfigManagerInstance };
