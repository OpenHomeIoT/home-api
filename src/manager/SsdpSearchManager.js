//@ts-check
import { parseString } from "xml2js";
import { Client as SSDPClient, SsdpHeaders } from "node-ssdp";
import request from "request";

import { getDeviceDatabaseInstance }from "../db/DeviceDatabase";
import { getExternalDeviceDatabaseInstance } from "../db/ExternalDeviceDatabase";
import IoTDevice from "../model/IoTDevice";

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
   *
   * @param {SsdpHeaders} headers the SsdpHeaders.
   * @param {*} _ unused
   * @param {*} rInfo the remote information
   */
  _handleSSDPSearchResponse(headers, _, rInfo) {
    if (!headers.ST) return;
    if (headers.ST === "urn:oshiot:device:hub:1-0") return;

    const usn = headers.USN;
    const st = headers.ST;
    const now = Date.now();

    if (st.indexOf("urn:oshiot:device") !== -1) {
      this._deviceDatabase.exists(usn)
      .then(exists => {
        if (!exists) {
          // load the services for the device
          const serviceDescriptionLocation = headers.LOCATION;
          this._loadServicesDescriptionForDevice(serviceDescriptionLocation)
          .then(services => {
            const iotDevice = new IoTDevice(headers.USN, serviceDescriptionLocation, rInfo.address, services, false, now, now, "disconnected");
            return this._deviceDatabase.insert(iotDevice.toJson());
          });
        } else {
          return this._updateDevice(headers, rInfo); // TODO: update services periodically
        }
      });
    } else if (st.indexOf("roku") !== -1) {
      this._externalDeviceDatabase.exists(usn)
      .then(exists => {
        if (!exists) {
          return this._externalDeviceDatabase.insert({
            _id: usn,
            usn: usn,
            ssdpDescriptionLocation: headers.LOCATION,
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

  }

  /**
   *
   * @param {string} servicesLocation the http url to the description of services.
   * @returns {Promise<string[]>} a promise returning an array of services.
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
            services.push(serviceType);
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
   * Update a device in the database.
   * @param {SsdpHeaders} headers the ssdp headers.
   * @param {*} rInfo the remote info
   */
  _updateDevice(headers, rInfo) {
    const now = Date.now();

    return this._deviceDatabase.get(headers.USN)
    .then(device => {
      device.timeLastSeen = now;
      return this._deviceDatabase.update(device);
    });
  }

  /**
   * Update an external device in the database.
   * @param {SsdpHeaders} headers the headers.
   * @param {*} rInfo the remote info.
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
