import Database from "../../common/database/Database";

let instance = null;

/**
 * @returns {ServiceVersionLedgerDatabase}
 */
const getServiceVersionLedgerDatabaseInstance = () => {
  if (instance == null)
    instance = new ServiceVersionLedgerDatabase();
  return instance;
}

class ServiceVersionLedgerDatabase extends Database {

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

export default ServiceVersionLedgerDatabase;
export { ServiceVersionLedgerDatabase };
