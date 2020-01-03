import Database from "./Database";

let instance = null;

/**
 * @returns {WifiSetupInfoDatabase}
 */
const getWifiSetupInfoDatabaseInstance = () => {
  if (instance == null)
    instance = new WifiSetupInfoDatabase();
  return instance;
}

class WifiSetupInfoDatabase extends Database {
  constructor() {
    super({
      name: "WifiSetupInfo",
      fields: [
        { name: "_id", type: "string" },
        { name: "ssid", type: "string" },
        { name: "timeDiscovered", type: "number" },
        { name: "timeLastSeen", type: "number" }
      ]
    }, { isMemoryDB: false });
  }
}

export default WifiSetupInfoDatabase;
export { getWifiSetupInfoDatabaseInstance };
