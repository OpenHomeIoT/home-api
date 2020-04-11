import nodemailer from "nodemailer";

let instance = null;

/**
 * Get the GmailService instance.
 * @returns {GmailService}
 */
const getGmailServiceInstance = () => {
  if (instance == null) instance = new GmailService();
  return instance;
};

const GMAIL_SERVICE = "OpenHomeIoT.service.Gmail";
const SERVICE_URL = "/gmail";

class GmailService {

  /**
   * GmailTextService.
   *
   */
  constructor() {
    this._mailer = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // TODO: do oauth instead
        pass: process.env.EMAIL_PASS  // TODO: do oauth instead
      }
    });
  }

  /**
   * Get the service registration details.
   */
  getServiceRegistrationDetails() {
    return {
      name: GMAIL_SERVICE,
      friendlyName: "Gmail",
      description: "The Gmail service enables the functionality of sending emails with Gmail.",
      inputs: [
        { name: "to", type: "string" },
        { name: "subject", type: "string" },
        { name: "body", type: "string" }
      ],
      author: "OpenHomeIoT",
      version: "1.0.0",
      repositoryUrl: "https://github.com/OpenHomeIoT/home-api",
      serviceUrl: SERVICE_URL
    };
  }

  /**
   *
   * @param {*} messageOptions
   */
  sendMessage(messageOptions) {
    return new Promise((resolve, reject) => {

    });
  }
}

export default getGmailServiceInstance;
export { GmailService, GMAIL_SERVICE };
