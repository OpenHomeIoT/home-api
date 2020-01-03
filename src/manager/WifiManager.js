import wifi from "node-wifi";
import WifiSetupInfoDatabase, { getWifiSetupInfoDatabaseInstance } from "../db/WifiSetupInfoDatabase";

let instance = null;

/**
 * @returns {WifiManager}
 */
const getWifiManagerInstace = () => {
  if (instance == null)
    instance = new WifiManager()
  return instance;
}

class WifiManager {

  constructor() {
    this._wifiSetupInfoDB = getWifiSetupInfoDatabaseInstance();

    // binding
    this.initialize = this.initialize.bind(this);
    this.startListening = this.startListening.bind(this);
    this.stopListening = this.stopListening.bind(this);
    this._searchForDevices = this._searchForDevices.bind(this);
  }

  /**
   * Initialize the WifiManager.
   */
  initialize() {
    wifi.init({ iface: null });
  }

  /**
   * Start listening for Open Source Home IoT devices that need to be configured.
   */
  startListening() {
    this._searchTimer = setInterval(() => this._searchForDevices(), 15000);
    this._cleanTimer = setInterval(() => this._cleanupOldWifiInfo(), 15000);
    this._searchForDevices();
  }

  /**
   * Stop listening.
   */
  stopListening() {
    clearInterval(this._searchTimer);
    clearInterval(this._cleanTimer);
  }

  /**
   * Cleanup any entries in the WifiSetupInfoDatabase that have not been seen within the last two minutes.
   */
  _cleanupOldWifiInfo() {
    this._wifiSetupInfoDB.getAll()
    .then(wifiInfos => {
      if (wifiInfos.length > 0) {
        wifiInfos.forEach(wifiInfo => this._verifyWifiInfo(wifiInfo));
      }
    })
  }

  /**
   * Handle a Wifi network scan result.
   * @param {Error} err the error, if any.
   * @param {any} networks the networks.
   */
  _handleWifiScan(err, networks) {
    if (err) {
      // TODO: ipc the error to main.
      return;
    }
    const wifiDB = this._wifiSetupInfoDB;
    const internalDevices = networks.filter(network => network.ssid.toLowerCase().startsWith("oshiot-"));
    if (internalDevices.length > 0) {
      const now = Date.now();
      internalDevices.forEach(network => {
        wifiDB.exists(network.ssid)
        .then(exists => {
          if (!exists) {
            const wifiInfo = { _id: network.ssid, ssid: network.ssid, timeDiscovered: now, timeLastSeen: now };
            return wifiDB.insert(wifiInfo);
          } else {
            // update the timeLastSeen of the wifi info
            return wifiDB.get(network.ssid)
            .then(wifiInfo => {
              wifiInfo.timeLastSeen = now;
              return wifiDB.update(wifiInfo);
            });
          }
        })
      });
    }
  }

  /**
   * Search of Open Source Home IoT devices that need to be configured to
   * access the network/Home Hub.
   */
  _searchForDevices() {
    wifi.scan((err, networks) => this._handleWifiScan(err, networks));
  }

  /**
   * Verify a Wifi info record.
   * @param {{ _id: string, ssid: string, timeDiscovered: number, timeLastSeen: number }} wifiInfo the wifi info.
   */
  _verifyWifiInfo(wifiInfo) {
    const currentTime = Date.now();
    if (currentTime - wifiInfo.timeLastSeen > 30000) {
      return this._wifiSetupInfoDB.delete(wifiInfo._id);
    }
    return Promise.resolve();
  }
};

export default WifiManager;
export { getWifiManagerInstace };
