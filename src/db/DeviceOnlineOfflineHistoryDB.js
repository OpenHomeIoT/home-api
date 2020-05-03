import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {DeviceOnlineOfflineHistoryDB}
 */
const getDeviceOnlineOfflineHistoryDBInstance = () => {
  if (instance == null)
    instance = new DeviceOnlineOfflineHistoryDB();
  return instance;
}

class DeviceOnlineOfflineHistoryDB extends Database {

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

export default DeviceOnlineOfflineHistoryDB;
export { DeviceOnlineOfflineHistoryDB };
