import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {ServiceLedgerDatabase}
 */
const getServiceLedgerDatabaseInstance = () => {
  if (instance == null)
    instance = new ServiceLedgerDatabase();
  return instance;
}

class ServiceLedgerDatabase extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options
   */
  constructor(options) {
    super({
      name: "ServiceLedger",
      isLedger: true,
      primaryKey: "id",
      fields: [
        { name: "id", type: "string" },
        { name: "name", type: "string" },
        { name: "friendlyName", type: "string" },
        { name: "description", type: "string" },
        { name: "ssdpName", type: "string" },
        { name: "currentSsdpVersionName", type: "string" }
      ]
    }, options);
  }
}

export default ServiceLedgerDatabase;
export { ServiceLedgerDatabase };
