import Database from "./Database";

let instance = null;

/**
 * Get the SsdpSearchResponseDatabase instance.
 * @returns {SsdpSearchResponseDatabase}
 */
const getSsdpSearchResponseDatabaseInstance = () => {
  if (instance == null) instance = new SsdpSearchResponseDatabase();
  return instance;
};

class SsdpSearchResponseDatabase extends Database {

  /**
   * SsdpSearchResponseDatabase.
   * Stores SSDP search response data.
   *
   * {
   *   _id: string,
   *   headers: object,
   *   rInfo: object
   * }
   */
  constructor(options) {
    super({
      name: "SSDPSearchResponse"
    }, options || { })
  }
}

export default getSsdpSearchResponseDatabaseInstance;
