//@ts-check
import { parseString } from "xml2js";
import { Client as SSDPClient, SsdpHeaders } from "node-ssdp";
import request from "request";

import { getDeviceDatabaseInstance }from "../db/DeviceDatabase";
import { getExternalDeviceDatabaseInstance } from "../db/ExternalDeviceDatabase";
import getSsdpSearchResponseDatabaseInstance from "../db/SsdpSearchResponseDatabase";

let instance = null;

/**
 * Get the SsdpSearchManager instance.
 * @returns {SsdpSearchManager} the SsdpSearchManager instance.
 */
const getSsdpSearchManagerInstance = () => {
  if (instance == null)
    instance = new SsdpSearchManager();
  return instance;
}

class SsdpSearchManager {

  constructor() {
    this._deviceDatabase = getDeviceDatabaseInstance();
    this._externalDeviceDatabase = getExternalDeviceDatabaseInstance();
    this._ssdpSearchResponseDB = getSsdpSearchResponseDatabaseInstance();

    this._timer = null;

    this._ssdpClient = new SSDPClient();
    this._ssdpClient.on("response", (headers, statusCode, rInfo) => this._handleSSDPSearchResponse(headers, statusCode, rInfo));

    this.startListening = this.startListening.bind(this);
    this.stopListening = this.stopListening.bind(this);
    this._handleResponse = this._handleSSDPSearchResponse.bind(this);
  }

  /**
   * Start listening for ESP8266 client SSDP signatures.
   * Also start broadcasting own SSDP signature.
   */
  startListening() {
    this._timer = setInterval(() => this._ssdpSearch(), 90000);
    this._ssdpSearch();
  }

  /**
   * Stop listening for client ssdp signatures and stop broadcasting.
   */
  stopListening() {
    if (this._timer) {
      clearInterval(this._timer);
    }
  }

  /**
   * Handle an SSDP search response that is originating from an 
   * OpenHomeIoT device.
   * @param {SsdpHeaders} headers the ssdp headers
   * @param {*} rInfo the remote info.
   * @returns {Promise<void>}
   */
  _handleOpenHomeIoTDeviceResponse(headers, rInfo) {
    const { USN: usn, LOCATION: serviceDescriptionLocation } = headers;
    const now = Date.now();
    return this._deviceDatabase.exists(usn)
      .then(exists => {
        if (!exists) {
          // load the services for the device
          this._loadServicesDescriptionForDevice(serviceDescriptionLocation)
          .then(services => {
            const iotDevice = {
              _id: usn,
              usn: usn,
              room: "none",
              ssdp: {
                descriptionLocation: serviceDescriptionLocation,
                ssdpPort: rInfo.port
              },
              network: {
                addressFamily: rInfo.family,
                ipAddress: rInfo.address
              },
              services,
              serviceStatuses: services.map(service => ({ name: service.name, version: service.version, status: "unknown", updated: now })),
              status: {
                configuredForHub: false,
                lastConfiguredForHub: 0,
                connectedToHub: false,
                lastConnectedToHub: 0,
                onlineOnNetwork: true,
                lastSeenOnNetwork: now
              }
            };
            return this._deviceDatabase.insert(iotDevice);
          });
        } else {
          return this._updateOpenHomeIoTDevice(headers, rInfo); // TODO: update services periodically
        }
      });
  }

  /**
   * Handle an SSDP search response that is originating from a 
   * Roku device. 
   * @param {SsdpHeaders} headers the ssdp headers
   * @param {*} rInfo the remote info .
   * @returns {Promise<void>}
   */
  _handleRokuDeviceResponse(headers, rInfo) {
    const { USN: usn, LOCATION: location } = headers;
    const now = Date.now();
    return this._externalDeviceDatabase.exists(usn)
    .then(exists => {
      if (!exists) {
        return this._externalDeviceDatabase.insert({
          _id: usn,
          usn: usn,
          ssdpDescriptionLocation: location,
          ipAddress: rInfo.address,
          timeDiscovered: now,
          timeLastSeen: now,
          company: "Roku",
          deviceType: "Roku"
        });
      } else {
        return this._updateExternalDevice(headers, rInfo);
      }
    });
  }

  /**
   * Handle an SSDP search response.
   * @param {SsdpHeaders} headers the SsdpHeaders.
   * @param {*} _ unused
   * @param {*} rInfo the remote information
   * @returns {Promise<void>}
   */
  _handleSSDPSearchResponse(headers, _, rInfo) {
    const { ST: st } = headers;
    if (!st) return Promise.resolve();
    
    return this._storeSsdpSearchResponse(headers, rInfo)
    .then(() => {
      if (st.indexOf("urn:OpenHomeIoT:device") !== -1) {
        return this._handleOpenHomeIoTDeviceResponse(headers, rInfo);
      } else if (st.indexOf("roku") !== -1) {
        return this._handleRokuDeviceResponse(headers, rInfo);
      }
    });
  }

  /**
   *
   * @param {string} servicesLocation the http url to the description of services.
   * @returns {Promise<{ name: string, version: string }[]>} a promise returning an array of services.
   */
  _loadServicesDescriptionForDevice(servicesLocation) {
    return new Promise((resolve, reject) => {
      request(servicesLocation, { method: "GET" }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }
        // body is a plaintext string so we need to parse it
        parseString(body, (parseErr, result) => {
          if (parseErr) {
            reject(err);
            return;
          }
          const services = [];

          for (let i = 0; i < result.root.device[0].serviceList.length; i++) {
            const service = result.root.device[0].serviceList[i].service;
            const serviceType = service[0].serviceType[0];
            const serviceID = service[0].serviceId[0];
            services.push({ name: serviceType, version: serviceID });
          }

          resolve(services);
        });
      });
    });
  }

  /**
   * search for esp8266 devices on the network.
   */
  _ssdpSearch() {
    // this._ssdpClient.search("urn:oshiot:device:wifi:1-0");
    console.log("[SsdpSearchManager] Searching for devices");
    this._ssdpClient.search("ssdp:all");
  }

  /**
   * Store a SSDP search response.
   * @param {SsdpHeaders} headers the ssdp headers.
   * @param {*} rInfo the remote info.
   * @returns {Promise<void>}
   */
  _storeSsdpSearchResponse(headers, rInfo) {
    const id = `${rInfo.address}${headers.USN}`;
    return this._ssdpSearchResponseDB.get(id)
    .then(ssdpSearchResponse => {
      if (!ssdpSearchResponse) {
        return this._ssdpSearchResponseDB.insert({ 
          _id: id,
          headers,
          rInfo
        });
      } else {
        ssdpSearchResponse.headers = headers;
        ssdpSearchResponse.rInfo = rInfo;
        return this._ssdpSearchResponseDB.update(ssdpSearchResponse);
      }
    });
  }

  /**
   * Update a device in the database.
   * @param {SsdpHeaders} headers the ssdp headers.
   * @param {*} rInfo the remote info
   */
  _updateOpenHomeIoTDevice(headers, rInfo) {
    const { USN: usn, LOCATION: location } = headers;
    const { address } = rInfo;
    const now = Date.now();
    
    return this._deviceDatabase.get(usn)
    .then(device => {
      device.ssdp.descriptionLocation = location;
      device.network.ipAddress = address;
      device.timeLastSeen = now;
      return this._deviceDatabase.update(device);
    });
  }

  /**
   * Update an external device in the database.
   * @param {SsdpHeaders} headers the headers.
   * @param {*} rInfo the remote info.
   * @returns {Promise<void>}
   */
  _updateExternalDevice(headers, rInfo) {
    const now = Date.now();

    return this._externalDeviceDatabase.get(headers.USN)
    .then(externalDevice => {
      externalDevice.ipAddress = rInfo.address;
      externalDevice.ssdpDescriptionLocation = headers.LOCATION;
      return this._externalDeviceDatabase.update(externalDevice);
    });
  }
}

export default SsdpSearchManager;
export { getSsdpSearchManagerInstance };
