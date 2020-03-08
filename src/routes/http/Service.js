import { Router } from "express";
import getInternalServiceDBInstance from "../../db/InternalServiceDB";

const router = Router();
const internalServiceDB = getInternalServiceDBInstance();

/**
 * GET /services
 */
router.get("/", (req, res) => {
  internalServiceDB.getAll()
  .then(services => res.json(services))
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * GET /services/:id
 */
router.get("/:id", (req, res) => {
  const id = req.params["id"];
  // TODO: verify id

  internalServiceDB.get(id)
  .then(service => res.json(service))
  .catch(err => res.status(404).json({ error: err }));
});

export default router;
