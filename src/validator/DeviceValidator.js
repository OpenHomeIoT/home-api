
class DeviceValidator {

  static isValidExternalDevice(device) {

  }

  /**
   *
   * @param {{ _id: string, usn: string, name: string, room: string, ssdp: { descriptionLocation: string, ipAddress: string }, services: [{ name: string, version: string }], serviceStatuses: [{ name: string, version: string, status: string, updated: number }], status: { configuredForHub: boolean, lastConfiguredForHub: number, connectedToHub: boolean, lastConnectedToHub: number, onlineOnNetwork: boolean, lastSeenOnNetwork: number }}} device the device.
   */
  static isValidOpenHomeIoTDevice(device) {
    if (!device) return false;
    if (!device._id || device._id === '' || typeof device._id !== "string") return false;
    if (!device.usn || device.usn === '' || typeof device.usn !== "string") return false;
    if (!device.name || device.name === '' || typeof device.name !== "string") return false;
    if (!device.room || device.room === '' || typeof device.room !== "string") return false;
    if (!device.ssdp || typeof device.ssdp !== "object") return false;
    if (!device.ssdp.descriptionLocation || device.ssdp.descriptionLocation === '' || typeof device.ssdp.descriptionLocation !== "string") return false;
    if (!device.ssdp.port || device.ssdp.port === 0 || typeof device.ssdp.port !== "number") return false;
    if (!device.network || typeof device.network !== "object") return false;
    if (!device.network.addressFamily || device.network.addressFamily === '' || typeof device.network.addressFamily !== "string") return false;
    if (!device.network.ipAddress || device.network.ipAddress || typeof device.network.ipAddress === "string") return false;
    if (!device.services) return false;
    if (!device.serviceStatuses) return false;
    if (device.services.length() !== device.serviceStatuses.length()) return false;
    if (!device.status || typeof device.status !== "object") return false;
    if (device.status.configuredForHub == undefined || typeof device.status.configuredForHub !== "boolean") return false;
    if (!device.status.lastConfiguredforHub || typeof device.status.lastConfiguredforHub !== "number") return false;
    if (device.status.connectedToHub == undefined || typeof device.status.connectedToHub !== "boolean") return false;
    if (!device.status.lastConnectedToHub || typeof device.status.lastConnectedToHub !== "number") return false;
    if (device.status.onlineOnNetwork === undefined || typeof device.status.onlineOnNetwork !== "boolean") return false;
    if (!device.status.lastSeenOnNetwork || typeof device.status.lastSeenOnNetwork !== "number") return false;
    return true;
  }
}

export default DeviceValidator;
