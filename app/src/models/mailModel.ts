// Libs
import { readFileSync } from "fs";
import { render } from "ejs";

import NodeMailer from "nodemailer";
import { Logger } from "winston";

import { Worker } from "@types";

// Class
class MailModel {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * A method to send the email to the card's owner, with the moment
   * of the cardcheck.
   */
  public async sendMail(worker: Worker, checkTime: Date): Promise<void> {
    // Treat the template args.
    const dateInfo = checkTime.toLocaleDateString().split("/");
    const date = `${dateInfo[1]}/${dateInfo[0]}/${dateInfo[2]}`;
    const time = checkTime.toLocaleTimeString();

    const firstName = worker.first_name;
    const lastName = worker.last_name;

    // Create the message
    const template = readFileSync("./src/templates/message.html");
    const message = render(template.toString("utf-8"), {
      firstName,
      lastName,
      date,
      time,
    });

    // Create the transport.
    this.logger.info("Sending email...");
    const transport = NodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    try {
      await transport.sendMail({
        to: worker.email,
        subject: `Controle de ponto ${new Date().toLocaleDateString()}`,
        cc: process.env.MAIL_CC,
        html: message,
      });
    } catch (err) {
      this.logger.error(`Couldn\'t send the email. Error: ${err}`);
    }
  }
}

// Code
export default MailModel;
