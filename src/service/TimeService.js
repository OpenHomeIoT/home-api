import schedule from "node-schedule";
import getAutomationDBInstance from "../db/AutomationDB";
import getAutomationRunnerInstance from "../automation/AutomationRunner";

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
const SERVICE_URL = "/time";

class TimeService {

  /**
   * TimeService.
   */
  constructor() {
    this._automationDB = getAutomationDBInstance();
    this._automationRunner = getAutomationRunnerInstance();

    this.getServiceRegistrationDetails = this.getServiceRegistrationDetails.bind(this);
    this.scheduleJobs = this.scheduleJobs.bind(this);
    this._cancelAllScheduledJobs = this._cancelAllScheduledJobs.bind(this);
  }

  /**
   * Get the service registration details.
   */
  getServiceRegistrationDetails() {
    return {
      name: TIME_SERVICE,
      friendlyName: "Date & Time",
      description: "The Date & Time service provides the ability to shedule events at a specified interval.",
      outputs: [
        { name: "day", type: "string" },
        { name: "time", type: "string" }
      ],
      author: "OpenHomeIoT",
      version: "1.0.0",
      repositoryUrl: "https://github.com/OpenHomeIoT/home-api",
      serviceUrl: SERVICE_URL
    };
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
