import Database from "./Database";

let instance = null;

/**
 * Get the SocketConnectionDB instance.
 * @returns {SocketConnectionDB}
 */
const getSocketConnectionDBInstance = () => {
  if (instance == null) instance = new SocketConnectionDB();
  return instance;
};

class SocketConnectionDB extends Database {

  /**
   * SocketConnectionDB.
   *
   * {
   *   _id: string, // socket id
   *   usn: string // device usn
   * }
   */
  constructor(options) {
    super({
      name: "SocketConnections",
      isMemory: true
    }, options || {});
  }

  /**
   * Is a device connected?
   * @param {string} usn the usn of the device.
   * @returns {Promise<boolean>}
   */
  isDeviceConnected(usn) {
    return new Promise((resolve, reject) => {
      const val = this._getTable().find({ usn }).value();
      resolve(
        val != null && val != undefined && val !== {}
      );
    });
  }
}

export default getSocketConnectionDBInstance;
