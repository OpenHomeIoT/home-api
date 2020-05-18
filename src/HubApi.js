import express from "express";
import http from "http";
import socketio from "socket.io";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";

import AutomationRoutes from "./routes/http/Automations";
import DeviceRoutes from "./routes/http/Device";
import ServiceRoutes from "./routes/http/Service";
import SettingsRoutes from "./routes/http/Settings";

import { onConnection } from "./routes/io/routes";
import { getHomeConfigManagerInstance } from "./manager/device/HomeConfigManager";
import { getSsdpSearchManagerInstance } from "./manager/ssdp/SsdpSearchManager";
import getConnectionManagerInstance from "./manager/device/ConnectionManager";
import getTimeServiceInstance  from "./service/TimeService";
import getInternalServiceDBInstance from "./db/InternalServiceDB";
import getGmailServiceInstance from "./service/GmailService";

class HubApi {

  /**
   * Create a new HubApi.
   */
  constructor() {
    this._internalServiceDB = getInternalServiceDBInstance();

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
      this._registerServices();
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
    this._api.use((req, res, next) => {
      // set the Access-Control-Allow-Origin header to *
      res.setHeader("Access-Control-Allow-Origin", "*"); // TODO: probably don't do this. security issues ya fool
      next();
    });

    // setup routes
    this._api.use("/automation", AutomationRoutes);
    this._api.use("/device", DeviceRoutes);
    this._api.use("/service", ServiceRoutes);
    this._api.use("/settings", SettingsRoutes);

    this._api.use((_, res, next) => {
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

  /**
   *
   * @param {{ name: string, friendlyName: string, author: string, repositoryUrl: string, version: string, serviceUrl: string }} serviceDetails
   */
  _getServiceID(serviceDetails) {
    return `${serviceDetails.name}:${serviceDetails.version}`;
  }

  /**
   * Register the internal services in the database.
   */
  _registerServices() {
    // register the gmail service
    const gmailServiceDetails = getGmailServiceInstance().getServiceRegistrationDetails();
    gmailServiceDetails._id = this._getServiceID(gmailServiceDetails);
    gmailServiceDetails.enabled = true;
    this._internalServiceDB.exists(gmailServiceDetails._id)
    .then(exists => (exists) ? Promise.resolve() : this._internalServiceDB.insert(gmailServiceDetails));

    // register the time service
    const timeServiceDetails = getTimeServiceInstance().getServiceRegistrationDetails();
    timeServiceDetails._id = this._getServiceID(timeServiceDetails);
    timeServiceDetails.enabled = true;
    this._internalServiceDB.exists(timeServiceDetails._id)
    .then(exists => (exists) ? Promise.resolve() : this._internalServiceDB.insert(timeServiceDetails));
  }
}

export default HubApi;
