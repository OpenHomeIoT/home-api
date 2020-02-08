import Database from "./Database";

let instance = null;

/**
 * Get the AutomationDB instance.
 * @returns {AutomationDB}
 */
const getAutomationDBInstance = () => {
  if (instance == null) instance = new AutomationDB();
  return instance;
};

class AutomationDB extends Database {

  /**
   * AutomationDB.
   * {
   *   _id: string,
   *   name: string, // the name of the automation
   *   trigger: {
   *     service: string, // the name of the trigger service that triggers the automation
   *     options: object // the options to pass to the trigger service.
   *   },
   *   actor: {
   *     service: string, // the name of the actor service.
   *     options: object // the options to pass to the actor service.
   *   }
   *   enabled: boolean, // whether or not the automation is enabled
   *   timeDisabled: number, // if enabled = false, this will be set to Date.now() of when the automation was disabled
   *   timeLastRun: number // the time this automation was last run
   * }
   *
   * @param { isTest?: boolean } options
   */
  constructor(options) {
    super({
      name: "Automations",
    }, options || {})
  }

  /**
   * Get all automations that use a given trigger service.
   * @param {string} triggerService the name of the trigger service.
   * @returns {Promise<{ _id: string, name: string, trigger: { service: string, options: object }, actor: { service: string, options: object }, enabled: boolean, timeDisabled: number, timeLastRun: number }[]>}
   */
  getAllAutomationsForTriggerService(triggerService) {
    return new Promise((resolve, reject) => {
      const vals = this._getTable()
      .find({ "trigger.service": triggerService })
      .value();
      resolve(vals);
    });
  }
}

export default getAutomationDBInstance;
export { AutomationDB };
