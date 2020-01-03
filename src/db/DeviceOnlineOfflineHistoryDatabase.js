import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {DeviceOnlineOfflineHistoryDatabase}
 */
const getDeviceOnlineOfflineHistoryDatabaseInstance = () => {
  if (instance == null)
    instance = new DeviceOnlineOfflineHistoryDatabase();
  return instance;
}

class DeviceOnlineOfflineHistoryDatabase extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options
   */
  constructor(options) {
    super({
      name: "DeviceOnlineOfflineHistory",
      isLedger: true,
      fields: [
        { name: "id", type: "bigint" }, // TODO: figure out id
        { name: "usn", type: "string" },
        { name: "time", type: "bigint" },
        { name: "isOnline", type: "bigint" }
      ]
    }, options);
  }
}

export default DeviceOnlineOfflineHistoryDatabase;
export { DeviceOnlineOfflineHistoryDatabase };
