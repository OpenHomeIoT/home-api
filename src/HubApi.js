import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import DeviceRoutes from "./routes/Device";
import { getSsdpManagerInstance } from "./manager/SsdpManager";
import { getWifiManagerInstace } from "./manager/WifiManager";

class HubApi {

  /**
   * Create a new HubApi.
   */
  constructor() {
    this._api = express();

    this._configureApi();
    this._ssdpManager = getSsdpManagerInstance();
    this._wifiManager = getWifiManagerInstace();
  }

  start(host, port) {
    return new Promise((resolve, reject) => {
      this._server = this._api.listen(port, host, () => resolve());
      this._ssdpManager.startListening();

      this._wifiManager.initialize();
      this._wifiManager.startListening();
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this._ssdpManager.stopListening();
      this._wifiManager.stopListening();
      this._server.close(err => {
        if (err) reject(err);
        else resolve();
      })
    });
  }

  _configureApi() {
    this._api.use(helmet());
    this._api.use(morgan("dev"));

    this._api.use("/device", DeviceRoutes);
  }
}

export default HubApi;
