import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {ConnectionBufferDatabase}
 */
const getConnectionBufferDatabaseInstance = () => {
  if (instance === null) {
    instance = new ConnectionBufferDatabase({ isMemoryDB: true });
  }
  return instance;
}

class ConnectionBufferDatabase extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options the options
   */
  constructor(options) {
    super({
      name: "DeviceConnectionBuffer",
      isLedger: false,
      primaryKey: "usn",
      fields: [
        { name: "usn", type: "string", required: true },
        { name: "timeAdded", type: "number", required: true },
        { name: "ipAddress", type: "string", required: true }
      ]
    }, options);
  }
}

export default ConnectionBufferDatabase;
export { getConnectionBufferDatabaseInstance };
