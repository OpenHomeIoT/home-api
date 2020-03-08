import { Router } from "express";
import getAutomationDBInstance from "../../db/AutomationDB";
import AutomationValidator from "../../validator/AutomationValidator";

const router = Router();
const automationDB = getAutomationDBInstance();

/**
 * Get all of the automations.
 */
router.get("/", (req, res) => {
  automationDB.getAll()
  .then(automations => res.json(automations))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Create a new automation.
 */
router.post("/", (req, res) => {
  const automation = req.body;
  if (!AutomationValidator.isValid(automation)) {
    res.status(400).json({ message: "Invalid automation." }); // TODO: handle better
    return;
  }

  automationDB.insert(automation)
  .then(() => res.json({ automation }))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Get an automation by its id.
 */
router.get("/:id", (req, res) => {
  const id = req.params["id"];
  // TODO: verify id
  automationDB.get(id)
  .then(automation => res.json(automation))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Update an existing automation.
 */
router.put("/:id", (req, res) => {
  const automation = req.body;

  if (!AutomationValidator.isValid(automation)) {
    res.status(400).json({ message: "Invalid automation." }); // TODO: handle better
    return;
  }

  automationDB.update(automation)
  .then(() => res.json(automation))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Delete an automation.
 */
router.delete("/:id", (req, res) => {
  const id = req.params["id"];
  // TODO: verify id
  automationDB.get()
  .then(automation => {
    res.json(automation);
    return automationDB.delete(id);
  });
});

export default router;
