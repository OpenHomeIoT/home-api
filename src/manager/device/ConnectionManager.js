import { getDeviceDBInstance } from "../../db/DeviceDB";
import getSocketConnectionDBInstance from "../../db/SocketConnectionDB";
import { getHomeConfigManagerInstance } from "./HomeConfigManager";

let instance = null;

/**
 * Get the ConnectionManager instance.
 * The ConnectionManager makes sure that all devices are connected to the Hub.
 * @returns {ConnectionManager}
 */
const getConnectionManagerInstance = () => {
  if (instance == null) instance = new ConnectionManager();
  return instance;
};

class ConnectionManager {

  /**
   * ConnectionManager.
   *
   */
  constructor() {
    this._deviceDB = getDeviceDBInstance();
    this._socketConnectionDB = getSocketConnectionDBInstance();
    this._homeConfigManager = getHomeConfigManagerInstance();
  }

  /**
   * Start watching for disconnected devices.
   */
  start() {
    this._connectionTimer = setInterval(() => this._makeSureAllDevicesAreConnected(), 10000);
    this._makeSureAllDevicesAreConnected();
  }

  /**
   * Stop watching for disconnected devices.
   */
  stop() {
    if (this._connectionTimer) clearInterval(this._connectionTimer);
  }

  /**
   * Make sure that all devices that are supposed to be connected are.
   * @returns {Promise<void[]>}
   */
  _makeSureAllDevicesAreConnected() {
    this._deviceDB.getAll()
    .then(iotDevices => {
      return Promise.all(iotDevices.map(iotDevice => {
        if (!iotDevice.status.connectedToHub && iotDevice.status.configuredForHub) {
          return this._homeConfigManager.configureDeviceForHub(iotDevice);
        } else if (iotDevice.status.connectedToHub) {
          return this._socketConnectionDB.isDeviceConnected(iotDevice.usn)
          .then(connected => {
            if (!connected) {
              return this._homeConfigManager.configureDeviceForHub(iotDevice);
            }
          });
        }
      }));
    })
  }
}

export default getConnectionManagerInstance;
