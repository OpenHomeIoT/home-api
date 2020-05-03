import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {ServiceLedgerDB}
 */
const getServiceLedgerDBInstance = () => {
  if (instance == null)
    instance = new ServiceLedgerDB();
  return instance;
}

class ServiceLedgerDB extends Database {

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

export default ServiceLedgerDB;
export { ServiceLedgerDB };
