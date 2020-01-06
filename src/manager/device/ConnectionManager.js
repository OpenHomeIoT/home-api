import { post } from "../../http/JsonHttp";
import { getWifiManagerInstace } from "../WifiManager";
import { getHomeWifiSetupDatabaseInstance } from "../../db/HomeWifiSetupDatabase";

let instance = null;

/**
 * Get the ConnectionManager instance.
 * @returns {ConnectionManager} the instance.
 */
const getConnectionManagerInstance = () => {
  if (instance == null)
    instance = new ConnectionManager();
  return instance;
};

class ConnectionManager {

  /**
   * Create a new ConnectionManager.
   */
  constructor() {
    this._homeWifiSetupDB = getHomeWifiSetupDatabaseInstance();
    this._wifiManager = getWifiManagerInstace();
  }

  /**
   * Configure an OpenHomeIoT Device to connect to the Home's wifi network.
   * @param {{ _id: string, ssid: string, networkType: string, timeDiscovered: number, timeLastSeen: number }} wifiSetupInfo the wifi setup info.
   */
  configureDeviceForHome(wifiSetupInfo) {
    return this._homeWifiSetupDB.get("0")
    .then(homeWifiSetup => {
      const { ssid, passphrase } = homeWifiSetup;
      let networkType = "open";
      if (homeWifiSetup.security.startsWith("WPA2")) networkType = "wpa2";
      else if (homeWifiSetup.security.startsWith("WPA")) networkType = "wpa";

      // TODO: encrypt http body
      return this._wifiManager.connectToOpenWifiNetwork(wifiSetupInfo.ssid)
      // TODO: wait until connected to wifi
      .then(() => post("http://10.1.1.1/wifi", { networkType, ssid, passphrase }))
      .finally(() => this._homeWifiSetupDB.get(this._wifiManager.connectToWifiNetwork(ssid, passphrase)));
    })
  }
}

export default ConnectionManager;
export { getConnectionManagerInstance };
