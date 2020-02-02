import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";

import DeviceRoutes from "./routes/Device";
import { getHomeConfigManagerInstance } from "./manager/device/HomeConfigManager";
import { getSsdpSearchManagerInstance } from "./manager/SsdpSearchManager";

class HubApi {

  /**
   * Create a new HubApi.
   */
  constructor() {
    this._api = express();

    this._configureApi();

    this._homeConfigManager = getHomeConfigManagerInstance();
    this._SsdpSearchManager = getSsdpSearchManagerInstance();
  }

  /**
   * Start the HubApi.
   * @param {string} host the host to listen on.
   * @param {number} port the port to listen on.
   */
  start(host, port) {
    return new Promise((resolve, reject) => {
      this._server = this._api.listen(port, host, () => resolve());
      this._homeConfigManager.start();
      this._SsdpSearchManager.startListening();
    });
  }

  /**
   * Stop the HubApi.
   * @returns {Promise<void>}
   */
  stop() {
    return new Promise((resolve, reject) => {
      this._homeConfigManager.stop();
      this._SsdpSearchManager.stopListening();
      this._server.close(err => {
        if (err) reject(err);
        else resolve();
      })
    });
  }

  /**
   * Configure express.
   */
  _configureApi() {
    this._api.use(helmet());
    this._api.use(morgan("dev"));
    this._api.use(bodyParser.json());

    this._api.use("/device", DeviceRoutes);
    this._api.use((req, res, next) => {
      res.status(404).send("Not found.");
    });
  }
}

export default HubApi;
