//@ts-check
import { Router } from "express";
import { getWifiManagerInstace } from "../manager/WifiManager";

const router = Router();
const wifiManager = getWifiManagerInstace();

/**
 * Get the available wifi networks that can be used to connect to Home.
 */
router.get("/", (req, res) => {
  wifiManager.getCurrentWifi()
  .then(wifi => res.json(wifi))
  .catch(err => res.status(400).json({ error: err }));
});

router.get("/home", (req, res) => {
  wifiManager.getHomeWifi()
  .then(wifi => {
    delete wifi.passphrase;
    res.json(wifi);
  })
  .catch(err => res.status(400).json({ error: err }));
});

/**
 * Set the wifi network given by ssid as the network to be used when connecting Home devices.
 */
router.put("/home", (req, res) => {
  const ssid = req.body["ssid"];
  const pass = req.body["passphrase"];
  // TODO: verify ssid
  wifiManager.setHomeWifi(ssid, pass)
  .then(() => res.json({ success: true }))
  .catch(err => res.status(400).json({ error: err }));
});


export default router;
