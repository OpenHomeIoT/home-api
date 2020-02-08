import getGmailTextServiceInstance, { GMAIL_TEXT_SERVICE } from "../service/actor/GmailTextService";

let instance = null;

/**
 * Get the AutomationRunner instance.
 * @returns {AutomationRunner}
 */
const getAutomationRunnerInstance = () => {
  if (instance == null) instance = new AutomationRunner();
  return instance;
};

class AutomationRunner {

  /**
   * AutomationRunner.
   *
   */
  constructor() {
    this._gmailTextService = getGmailTextServiceInstance();

    // binding
    this.runAutomation = this.runAutomation.bind(this);
  }

  /**
   * Run an automation.
   * @param {{ _id: string, name: string, trigger: { service: string, options: object }, actor: { service: string, options: object }, enabled: boolean, timeDisabled: number, timeLastRun: number }} automation the automation.
   */
  runAutomation(automation) {
    switch (automation.actor.service) {
      case GMAIL_TEXT_SERVICE:
        this._gmailTextService.sendMessage(automation.actor.options);
        // TODO: log automation ran
        break;
      default:
        break;
    }
  }
}

export default getAutomationRunnerInstance;
export { AutomationRunner };
