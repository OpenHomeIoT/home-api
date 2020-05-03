import Database from "./Database";

let instance = null;

/**
 * Get the SsdpSearchResponseDB instance.
 * @returns {SsdpSearchResponseDB}
 */
const getSsdpSearchResponseDBInstance = () => {
  if (instance == null) instance = new SsdpSearchResponseDB();
  return instance;
};

class SsdpSearchResponseDB extends Database {

  /**
   * SsdpSearchResponseDB.
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

export default getSsdpSearchResponseDBInstance;
