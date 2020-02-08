
class AutomationValidator {

  /**
   * Verify if an Automation is valid.
   * @param {{ _id: string, name: string, trigger: { service: string, options: object }, actor: { service: string, options: object }, enabled: boolean, timeDisabled: number, timeLastRun: number }} automation the automation.
   * @returns {boolean}
   */
  static isValid(automation) {
    if (!automation) return false;
    if (!automation._id || automation._id === '') return false;
    if (!automation.name || automation.name === '') return false;
    if (!automation.trigger) return false;
    if (!automation.trigger.service || automation.trigger.service === '') return false;
    // TODO: verify automation.trigger.options
    if (!automation.actor) return false;
    if (!automation.actor.service || automation.actor.service === '') return false;
    // TODO: verify automation.actor.options
    if (automation.enabled == undefined) return false;
    if (automation.enabled === false && (!automation.timeDisabled || automation.timeDisabled === 0)) return false;
    return true;
  }
}

export default AutomationValidator;
