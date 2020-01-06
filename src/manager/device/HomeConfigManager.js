import ConnectionBufferDatabase, { getConnectionBufferDatabaseInstance } from "../../db/ConnectionBufferDatabase";
import DeviceManager, { getDeviceManagerInstance } from "./DeviceManager";

const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;

let instance = null

/**
 * @returns {HomeConfigManager} the instance.
 */
const getHomeConfigManagerInstance = () => {
  if (instance == null) {
    instance = new HomeConfigManager(getConnectionBufferDatabaseInstance(), getDeviceManagerInstance());
  }
  return instance;
}

class HomeConfigManager {

  /**
   *
   * @param {ConnectionBufferDatabase} connectionBufferDatabase
   * @param {DeviceManager} deviceManager
   */
  constructor(connectionBufferDatabase, deviceManager) {
    this._connectionBufferDatabase = connectionBufferDatabase;
    this._deviceManager = deviceManager

    // TODO: binding
    this._checkForConnectionInfo = this._checkForConnectionEntries.bind(this);
  }

  /**
   * Initialize the connection manager and start looking for devices to connect.
   */
  initialize() {
    this._connectionTimer = setInterval(() => this._checkForConnectionEntries(), 20000);
  }

  /**
   * Set that a device has disconnected from the hub and needs to reconnect.
   * @param {string} usn the device's usn.
   * @returns {Promise<void>}
   */
  setDeviceHasDisconnected(usn) {
    this._deviceManager.getDeviceByUsn(usn)
    .then(iotDevice => this._connectionBufferDatabase.insert({ usn, timeAdded: Date.now(), ipAddress: iotDevice.getAddress() }));
  }

  /**
   * Check to see if there is any connection information in the database. If there is,
   * attempt to reconnect the device.
   * @returns {Promise<void>}
   */
  _checkForConnectionEntries() {
    this._connectionBufferDatabase.getAll()
    .then(connections => {
      if (connections.length > 0) {
        return this._connectDevicesToHub(connections)
        .then(() => this._setDevicesReconnecting(connections));
      }
    })
  }

  /**
   * Connect a device to the Home.
   * @param {string} ipAddress the ip address of the device.
   * @returns {Promise<void>}
   */
  _connectDeviceToHome(ipAddress) {
    return new Promise((resolve, reject) => {
      const url = `http://${ipAddress}/config_parent`;
      const body = JSON.stringify({
        parent: {
          address: ADDRESS,
          port: PORT
        }
      });
      request(url, { method: "POST", body }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  _getDisconnectedDevicesThatAreNotReconnecting() {
    return this._deviceManager.getAllDevices() // TODO: do this filtering at the database level
    .then(iotDevices => {

    });
  }

  /**
   * Connnect devices to this Hub
   * @param {{ usn: string, timeAdded: number, ipAddress: string }[]} connectionInfos the connection info for the devices.
   * @returns {Promise<void>}
   */
  _connectDevicesToHub(connectionInfos) {
    // TODO: filter connectionInfos for devices whose connectionStatus is not "reconnecting"
    return Promise.all(map(({ ipAddress }) => this._connectDeviceToHome(ipAddress)));
  }

  /**
   *
   * @param {{ usn: string, timeAdded: number, ipAddress: string}[]} connectionInfos the connection info for the devices.
   */
  _setDevicesReconnecting(connectionInfos) {
    return Promise.all(connectionInfos.map(({ usn }) => this._deviceManager.getDeviceByUsn(usn).then(iotDevice => {
      iotDevice.setConnectionStatus("reconnecting");
      return this._deviceManager.updateDevice(iotDevice.toJson());
    })));
  }
}

export default HomeConfigManager;
export { getHomeConfigManagerInstance };
