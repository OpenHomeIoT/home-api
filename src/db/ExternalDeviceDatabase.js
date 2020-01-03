//@ts-check
import Database from "./Database";

let instance = null;

/**
 * @returns {ExternalDeviceDatabase}
 */
const getExternalDeviceDatabaseInstance = () => {
    if (instance == null)
        instance = new ExternalDeviceDatabase();
    return instance;
}

class ExternalDeviceDatabase extends Database {

    constructor() {
        super({
            name: "ExternalDevices",
            isLedger: false,
            fields: [
                { name: "usn", type: "string" },
                { name: "ssdpDescriptionLocation", type: "string" },
                { name: "ipAddress", type: "string" },
                { name: "timeDiscovered", type: "number" },
                { name: "timeLastSeen", type: "number" },
                { name: "company", type: "string" },
                { name: "deviceType", type: "string" },
                { name: "name", type: "string" },
                { name: "status", type: "string" }
            ]
        }, {});
    }
}

export default ExternalDeviceDatabase;
export { getExternalDeviceDatabaseInstance };
