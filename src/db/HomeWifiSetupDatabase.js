import Database from "./Database";

let instance = null;

/**
 * Get the HomeWifiSetupDatabase instance.
 * @returns {HomeWifiSetupDatabase} the instance.
 */
const getHomeWifiSetupDatabaseInstance = () => {
  if (instance == null)
    instance = new HomeWifiSetupDatabase();
  return instance;
};

class HomeWifiSetupDatabase extends Database {

  /**
   * Create a new HomeWifiSetupDatabase.
   */
  constructor() {
    super({
      name: "HomeWifiSetup",
      fields: [
        { name: "_id", type: "number" },
        { name: "ssid", type: "string" },
        { name: "security", type: "string" },
        { name: "passphrase", type: "string" }, // TODO: either encrypt this field, or move Wifi credentials to secure DB
        { name: "timeCreated", type: "number" },
        { name: "timeLastUpdated", type: "number" }
      ]
    }, {});
  }

  _initialize() {
    const now = Date.now();
    this.insert({ _id: "0", ssid: "", security: "", passphrase: "", timeCreated: now, timeLastUpdated: now });
  }
}

export default HomeWifiSetupDatabase;
export { getHomeWifiSetupDatabaseInstance };
