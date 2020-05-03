//@ts-check
import Database from "./Database";

let instance = null;

/**
 * @returns {ExternalDeviceDB}
 */
const getExternalDeviceDBInstance = () => {
    if (instance == null)
        instance = new ExternalDeviceDB();
    return instance;
}

class ExternalDeviceDB extends Database {

    constructor() {
        super({
            name: "ExternalDevices",
            isLedger: false
        }, {});
    }
}

export default ExternalDeviceDB;
export { getExternalDeviceDBInstance };
