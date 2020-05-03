import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {ServiceVersionLedgerDB}
 */
const getServiceVersionLedgerDBInstance = () => {
  if (instance == null)
    instance = new ServiceVersionLedgerDB();
  return instance;
}

class ServiceVersionLedgerDB extends Database {

  /**
   *
   * @param {{ isMemoryDB?: boolean, isTest?: boolean }} options
   */
  constructor(options) {
    super({
      name: "ServiceVersionLedger",
      isLedger: true,
      primaryKey: "serviceVersionName",
      fields: [
        { name: "serviceVersionName", type: "string" },
        { name: "serviceName", type: "string" },
        { name: "version", type: "string" },
        { name: "timeInstalledOnHub", type: "bigint", includeInUpdate: false }
      ]
    }, options);
  };
}

export default ServiceVersionLedgerDB;
export { ServiceVersionLedgerDB };
