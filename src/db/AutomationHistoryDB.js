import Database from "./Database";

let instance = null;

/**
 * Get the AutomationHistoryDB instance.
 * @returns {AutomationHistoryDB}
 */
const getAutomationHistoryDBInstance = () => {
  if (instance == null) instance = new AutomationHistoryDB();
  return instance;
};

class AutomationHistoryDB extends Database {

  /**
   * AutomationHistoryDB.
   * {
   *   _id: string,
   *   automationID: string,
   *   timeStarted: number,
   *   timeEnded: number
   * }
   */
  constructor(options) {
    super({
      name: "AutomationHistory",
    }, options || {});
  }
}

export default getAutomationHistoryDBInstance;
export { AutomationHistoryDB };
