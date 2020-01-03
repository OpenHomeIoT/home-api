import Database from "./Database";

let instance = null;

/**
 * @returns {DeviceDatabase}
 */
const getDeviceDatabaseInstance = () => {
  if (instance == null)
    instance = new DeviceDatabase({ });
  return instance;
}

class DeviceDatabase extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options
   */
  constructor(options) {
    super({
      name: "Devices",
      isLedger: false,
      primaryKey: "usn",
      fields: [
        { name: "usn", type: "string", required: true },
        { name: "ssdpDescriptionLocation", type: "string", required: true },
        { name: "ipAddress", type: "string", required: true },
        { name: "services", type: "string", required: true },
        { name: "configuredAsChild", type: "boolean", required: true },
        { name: "timeLastSeen", type: "number", required: true },
        { name: "timeDiscovered", type: "number", required: true },
        { name: "connectionStatus", type: "string", required: true },
        { name: "name", type: "string", required: true }
      ]
    }, options || {});
  }
}

export default DeviceDatabase;
export { getDeviceDatabaseInstance };
