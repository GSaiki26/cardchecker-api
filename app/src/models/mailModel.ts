// Libs
import { readFileSync } from 'fs';
import { render } from 'ejs';

import NodeMailer from 'nodemailer';
import { Logger } from 'winston';

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
    public async sendMail(to: string, checkTime: Date): Promise<void> {
        this.logger.info('Sending email...');

        // Treat the checktime.
        const date = checkTime.toLocaleDateString();
        const time = checkTime.toLocaleTimeString();

        // Create the message
        const template = readFileSync('./src/templates/message.html');
        const message = render(template.toString('utf-8'), {date, time});

        // Create the transport.

        const transport = NodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
        try {
            await transport.sendMail({
                to,
                subject: `Controle de ponto ${new Date().toLocaleDateString()}`,
                cc: process.env.MAIL_CC,
                html: message
            });
        } catch (err) {
            this.logger.error(`Couldn\'t send the email. Error: ${err}`);
        }

    }
}

// Code
export default MailModel;