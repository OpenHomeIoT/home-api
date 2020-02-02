import express from "express";
import http from "http";
import socketio from "socket.io";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";

import DeviceRoutes from "./routes/http/Device";
import { onConnection } from "./routes/io/routes";
import { getHomeConfigManagerInstance } from "./manager/device/HomeConfigManager";
import { getSsdpSearchManagerInstance } from "./manager/SsdpSearchManager";
import getConnectionManagerInstance from "./manager/device/ConnectionManager";

class HubApi {

  /**
   * Create a new HubApi.
   */
  constructor() {
    this._api = express();
    this._configureApi();
    this._server = http.Server(this._api);
    this._io = socketio(this._server);
    this._configureSocketIO();

    this._connectionManager = getConnectionManagerInstance();
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
      this._connectionManager.start();
      this._homeConfigManager.start();
      this._SsdpSearchManager.startListening();
      this._server.listen(port, host, resolve);
    });
  }

  /**
   * Stop the HubApi.
   * @returns {Promise<void>}
   */
  stop() {
    return new Promise((resolve, reject) => {
      this._connectionManager.stop();
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
      next();
    });
  }

  /**
   * Configure Socket.IO
   */
  _configureSocketIO() {
    this._io.on("connection", onConnection);
  }
}

export default HubApi;
