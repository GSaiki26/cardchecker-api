// Libs
import { readFileSync } from "fs";
import { render } from "ejs";

import NodeMailer from "nodemailer";
import { Logger } from "winston";

import workerMessages from "../proto/worker_pb";

// Class
class MailModel {
  private mailUser = process.env.MAIL_USER;
  private mailPass = process.env.MAIL_PASS;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * A method to send the email to the card's owner, with the moment
   * of the cardcheck.
   */
  public async sendMail(
    worker: workerMessages.Worker,
    checkTime: Date
  ): Promise<void> {
    // Treat the template args.
    const dateInfo = checkTime.toLocaleDateString().split("/");
    const date = `${dateInfo[1]}/${dateInfo[0]}/${dateInfo[2]}`;
    const time = checkTime.toLocaleTimeString();

    const firstName = worker.getFirstname();
    const lastName = worker.getLastname();

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
        user: this.mailUser,
        pass: this.mailPass,
      },
    });
    try {
      await transport.sendMail({
        to: worker.getEmail(),
        subject: `Controle de ponto ${date}`,
        cc: process.env.MAIL_CC,
        html: message,
      });
    } catch (err) {
      this.logger.error("Couldn't send the email. " + err);
    }
  }
}

// Code
export default MailModel;
