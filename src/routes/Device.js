import { Router } from "express";

import { getExternalDeviceDatabaseInstance } from "../db/ExternalDeviceDatabase";
import { getDeviceDatabaseInstance } from "../db/DeviceDatabase";
import { getWifiSetupInfoDatabaseInstance } from "../db/WifiSetupInfoDatabase";

const router = Router();
const externalDeviceDB = getExternalDeviceDatabaseInstance();
const internalDeviceDB = getDeviceDatabaseInstance();
const wifiSetupInfoDB = getWifiSetupInfoDatabaseInstance();

/**
 * Get the external devices.
 */
router.get("/external", (req, res) => {
  externalDeviceDB.getAll()
  .then(externalDevices => res.json(externalDevices))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get an external device based on its usn
 */
router.get("/external/:usn", (req, res) => {
  const usn = req.params["usn"];
  // TODO: verify usn
  externalDeviceDB.get(usn)
  .then(device => res.json(device))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Update an external device based on its usn.
 */
router.put("/external", (req, res) => {
  const device = req.body;
  // TODO: verify device
  externalDeviceDB.update(device)
  .then(() => res.json(device))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get the internal devices.
 */
router.get("/internal", (req, res) => {
  internalDeviceDB.getAll()
  .then(internalDevices => res.json(internalDevices))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get an internal device based on its usn.
 */
router.get("/internal/:usn", (req, res) => {
  const usn = req.params["usn"];
  // TODO: verify usn
  internalDeviceDB.get(usn)
  .then(internalDevice => res.json(internalDevice))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Update an internal device based on its usn.
 */
router.put("/internal", (req, res) => {
  const device = req.body;
  // TODO: verify device
  internalDeviceDB.update(device)
  .then(() => res.json(device))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get the internal devices that need to be configured to use
 * the Home Hub.
 */
router.get("/configurable/", (req, res) => {
  wifiSetupInfoDB.getAll()
  .then(devicesToBeConfigured => res.json(devicesToBeConfigured))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get an internal device that needs to be configured by its ID.
 */
router.get("/configurable/:id", (req, res) => {
  const id = req.params["id"];
  // TODO: verify id
  wifiSetupInfoDB.get(id)
  .then(deviceToBeConfigured => res.json(deviceToBeConfigured))
  .catch(err => res.status(400).json({ error: err }));
});

export default router;
