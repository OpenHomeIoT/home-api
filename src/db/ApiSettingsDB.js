import Database from "./Database";

let instance = null;

/**
 * Get the ApiSettingsDB instance.
 * @returns {ApiSettingsDB}
 */
const getApiSettingsDBInstance = () => {
  if (instance == null) instance = new ApiSettingsDB();
  return instance;
};

class ApiSettingsDB extends Database {

  /**
   * ApiSettingsDB.
   * {
   *   _id: "_",
   *   network: {
   *     hostname: string,
   *     servicesPort: int
   *   }
   * }
   *
   * @param { isTest?: boolean } options
   */
  constructor(options) {
    super({
      name: "ApiSettings",
    }, options || {})
  }

  _initialize() {
    return this.insert({
      _id: "_",
      network: {
        hostname: "0.0.0.0",
        servicesPort: 30027
      }
    });
  }
}

export default getApiSettingsDBInstance;
export { ApiSettingsDB };
