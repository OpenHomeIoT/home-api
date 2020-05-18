import { Router } from "express";
import getApiSettingsDBInstance from "../../db/ApiSettingsDB";

const router = Router();
const settingsDB = getApiSettingsDBInstance();

/**
 * GET /settings
 */
router.get("/", (req, res) => {
  settingsDB.get("_")
  .then(settings => res.json(settings))
  .catch(err => res.status(400).json({ error: err }));
});

router.post("/", (req, res) => {
  const settings = req.body;
  // TODO: validate settings
  if (!settings) {
    res.status(400).json({ error: "'settings' is not defined." });
    return;
  }
  if (!settings.network) {
    res.status(400).json({ error: "'settings.network' is not defined." });
    return;
  }

  settings._id = "_";
  settingsDB.update(settings)
  .then(() => res.status(200).json(settings))
  .catch(err => res.status(400).json({ error: err }));
});

export default router;
