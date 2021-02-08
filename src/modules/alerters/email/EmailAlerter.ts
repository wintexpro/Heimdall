import { IAlerter } from '../IAlerter';
import { EmailAlerterConfig } from '../../config/schema';
import { Message, SMTPClient } from 'emailjs';

export class EmailAlerter implements IAlerter {

    public client: SMTPClient;
    public from: string;
    public to: string;
    public cc?: string;
    public subject?: string;

    public constructor(config: EmailAlerterConfig) {
        this.client = new SMTPClient({
            user: config.auth.user,
            password: config.auth.pass,
            host: config.host,
            ssl: config.secure,
        });
        this.testConfig(config.auth.user);
        this.from = config.message.from;
        this.to = config.message.to;
        this.subject = config.message.subject
    }

    public async alert(lokiResult: [string, string]): Promise<boolean> {
        if (lokiResult[1]) {
            try {
                const message = new Message({
                    text: this.buildMessageFromLokiData(lokiResult),
                    from: this.from,
                    to: this.to,
                    subject: this.subject ? this.subject : '',
                });
                await this.client.sendAsync(message);
            } catch (error) {
                console.log(`Email alert error: ${error}`);
            }
        } else {
            return false;
        }
        return true;
    }

    private async testConfig(user: string): Promise<void> {
        console.log(user);
        console.log(`Email alerts initialized for ${user}`);
        return;
    }

    private buildMessageFromLokiData(message: [string, string]): string {
        return `${new Date(parseInt(message[0]) / 1000000)}: ${message[1]}`;
    }

}
