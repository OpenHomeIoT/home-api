import wifi from "node-wifi";
import WifiSetupInfoDatabase, { getWifiSetupInfoDatabaseInstance } from "../db/WifiSetupInfoDatabase";
import { getHomeWifiSetupDatabaseInstance } from "../db/HomeWifiSetupDatabase";

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
    this._homeWifiSetupDB = getHomeWifiSetupDatabaseInstance();
    this._wifiSetupInfoDB = getWifiSetupInfoDatabaseInstance();

    // binding
    this.connectToWifiNetwork = this.connectToWifiNetwork.bind(this);
    this.disconnectFromWifiNetwork = this.disconnectFromWifiNetwork.bind(this);
    this.getCurrentWifi = this.getCurrentWifi.bind(this);
    this.initialize = this.initialize.bind(this);
    this.startListening = this.startListening.bind(this);
    this.stopListening = this.stopListening.bind(this);
    this._searchForDevices = this._searchForDevices.bind(this);
  }

  /**
   * Connect to an Open (a Home Device's) Wifi network.
   * @param {string} ssid the ssid of the network.
   * @returns {Promise<void>}
   */
  connectToOpenWifiNetwork(ssid) {
    return this.connectToWifiNetwork(ssid, undefined);
  }

  /**
   * Connect to a Wifi network.
   * @param {string} ssid the ssid of the network.
   * @param {string} passphrase the passphrase to the network.
   */
  connectToWifiNetwork(ssid, passphrase) {
    return this.disconnectFromWifiNetwork()
    .then(wifi.connect((passphrase) ? { ssid, password: passphrase } : {ssid}));
  }

  /**
   * Disconnect from the current Wifi network.
   * @returns {Promise<void>}
   */
  disconnectFromWifiNetwork() {
    return wifi.disconnect();
  }

  /**
   * Find a Wifi object that this device is currently using by it's ssid.
   * @param {string} ssid the ssid to search for.
   */
  findCurrentWifi(ssid) {
    return this.getCurrentWifi()
    .then(wifis => {
      for (const wifi of wifis) {
        if (wifi.ssid === ssid) return wifi;
      }
      return null;
    });
  }

  /**
   * Get the current Wifi connection(s).
   * @returns {Promise<{ iface: string, ssid: string, bssid: string, mac: string, channel: number, frequency: number, signal_level: number, quality: number, security: string, security_flags: string, mode: string }[]>}
   */
  getCurrentWifi() {
    return wifi.getCurrentConnections();
  }

  /**
   * Get the current wifi network for Home.
   * @returns {Promise<>} // TODO: type signature
   */
  getHomeWifi() {
    return this._homeWifiSetupDB.get("0");
  }

  /**
   * Initialize the WifiManager.
   */
  initialize() {
    wifi.init({ iface: null });
  }

  /**
   * Set the Wifi network to use as the Home wifi.
   * @param {string} ssid the ssid.
   * @param {string} passphrase the passphrase.
   * @returns {Promise<void>}
   */
  setHomeWifi(ssid, passphrase) {
    return this.findCurrentWifi(ssid)
    .then(wifiInfo => {
      if (wifiInfo == null) return null;
      this._homeWifiSetupDB.get("0")
      .then(wifiSetup => {
        wifiSetup.ssid = wifiInfo.ssid;
        wifiSetup.security = wifiInfo.security;
        wifiSetup.passphrase = passphrase;
        wifiSetup.timeLastUpdated = Date.now();
        return this._homeWifiSetupDB.update(wifiSetup);
      });
    })
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
