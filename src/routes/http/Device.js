import { Router } from "express";

import { getExternalDeviceDatabaseInstance } from "../../db/ExternalDeviceDatabase";
import { getDeviceDatabaseInstance } from "../../db/DeviceDatabase";

const router = Router();
const externalDeviceDB = getExternalDeviceDatabaseInstance();
const internalDeviceDB = getDeviceDatabaseInstance();

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
router.get("/OpenHomeIoT", (req, res) => {
  internalDeviceDB.getAll()
  .then(internalDevices => res.json(internalDevices))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get an internal device based on its usn.
 */
router.get("/OpenHomeIoT/:usn", (req, res) => {
  const usn = req.params["usn"];
  // TODO: verify usn
  internalDeviceDB.get(usn)
  .then(internalDevice => res.json(internalDevice))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Update an internal device based on its usn.
 */
router.put("/OpenHomeIoT", (req, res) => {
  const device = req.body;
  // TODO: verify device
  internalDeviceDB.update(device)
  .then(() => res.json(device))
  .catch(err => res.status(400).json({ error: err }));
});

export default router;
