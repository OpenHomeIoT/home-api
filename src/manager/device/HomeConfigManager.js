import rp from "request-promise";
import { getDeviceDBInstance } from "../../db/DeviceDB";

const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;

let instance = null

/**
 * @returns {HomeConfigManager} the instance.
 */
const getHomeConfigManagerInstance = () => {
  if (instance == null) {
    instance = new HomeConfigManager(getDeviceDBInstance());
  }
  return instance;
}

class HomeConfigManager {

  constructor(DeviceDB) {
    this._deviceDB = DeviceDB;

    // TODO: binding
    this._checkForDevicesToConfigure = this._checkForDevicesToConfigure.bind(this);
  }

  /**
   * Connect a device to the Home Hub.
   * @param {any} device the device. // TODO: device type
   * @returns {Promise<void>}
   */
  configureDeviceForHub(device) {
    // TODO: get ip address and port from database.
    const request = {
      uri: `http://${device.network.ipAddress}/config_parent`,
      method: "POST",
      body: {
        parentHost: "homehubdev.local",
        parentPort: 30027
      },
      json: true
    };
    return rp(request)
    .then(_ => {
      device.status.configuredForHub = true;
      device.status.lastConfiguredForHub = Date.now();
      return this._deviceDB.update(device);
    })
    .catch(err => {});
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
   * @param {string} socketID the socket id.
   */
  setDeviceHasConnected(usn, socketID) {
    return this._deviceDB.get(usn)
    .then(iotDevice => {
      iotDevice.status.connectedToHub = true;
      iotDevice.status.lastConnectedToHub = Date.now();
      iotDevice.status.socketID = socketID;
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
      iotDevice.status.socketID = "";
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
    .then(unconfigured => Promise.all(unconfigured.map(device => this.configureDeviceForHub(device))));
  }
}

export default HomeConfigManager;
export { getHomeConfigManagerInstance };
