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

/**
 * {
 *    _id: string,
 *    usn: string,
 *    name: string,
 *    room: string,
 *    ssdp: {
 *      descriptionLocation: string,
 *      port: number
 *    },
 *    network: {
 *      addressFamily: string,
 *      ipAddress: string
 *    },
 *    services: [
 *      { name: string, version: string }
 *    ],
 *    serviceStatuses: [
 *      { name: string, version: string, status: string, updated: number }
 *    ],
 *    status: {
 *      configuredForHub: boolean,
 *      lastConfiguredForHub: number,
 *      connectedToHub: boolean,
 *      lastConnectedToHub: number,
 *      onlineOnNetwork: boolean,
 *      lastSeenOnNetwork: number
 *    },
 * }
 */
class DeviceDatabase extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options
   */
  constructor(options) {
    super({
      name: "OpenHomeIoTDevices",
      isLedger: false
    }, options || {});
  }
}

export default DeviceDatabase;
export { getDeviceDatabaseInstance };
