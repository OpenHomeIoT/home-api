import Database from "./Database";

let instance = null;

/**
 * Get the InternalServiceDB instance.
 * @returns {InternalServiceDB}
 */
const getInternalServiceDBInstance = () => {
  if (instance == null) instance = new InternalServiceDB();
  return instance;
};

class InternalServiceDB extends Database {

  /**
   * InternalServiceDB.
   * {
   *   _id: string,
   *   name: string,
   *   friendlyName: string,
   *   description: string,
   *   enabled: boolean,
   *   author: string,
   *   repositoryUrl: string,
   *   version: string,
   *   serviceUrl: string
   * }
   */
  constructor(options) {
    super({
      name: "OpenHomeIoTServices"
    }, options || {});
  }
}

export default getInternalServiceDBInstance;
export { InternalServiceDB };
