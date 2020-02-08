import schedule from "node-schedule";
import getAutomationDBInstance from "../../db/AutomationDB";
import getAutomationRunnerInstance from "../../automation/AutomationRunner";

let instance = null;

/**
 * Get the TimeService instance.
 * @returns {TimeService}
 */
const getTimeServiceInstance = () => {
  if (instance == null) instance = new TimeService();
  return instance;
};

const TIME_SERVICE = "OpenHomeIoT.service.Time";

class TimeService {

  /**
   * TimeService.
   */
  constructor() {
    this._automationDB = getAutomationDBInstance();
    this._automationRunner = getAutomationRunnerInstance();

    this.scheduleJobs = this.scheduleJobs.bind(this);
    this._cancelAllScheduledJobs = this._cancelAllScheduledJobs.bind(this);
  }

  /**
   * Schedule all jobs.
   */
  scheduleJobs() {
    // cancel any previously scheduled jobs.
    this._cancelAllScheduledJobs();

    // schedule the new jobs.
    this._automationDB.getAllAutomationsForTriggerService(TIME_SERVICE)
    .then(automations => {
      automations.filter(automation => automation.enabled).forEach(automation => {
        scheduler.scheduleJob(automation.trigger.options.cronSchedule, () => { this._automationRunner.runAutomation(automation); });
        // TODO: mark scheduled for execution
      });
    })
  }

  /**
   * Cancel all of the currently scheduled jobs.
   */
  _cancelAllScheduledJobs() {
    for (const scheduledJob in schedule.scheduledJobs) {
      schedule.cancelJob(scheduledJob);
    }
  }
}

export default getTimeServiceInstance;
export { TimeService };
