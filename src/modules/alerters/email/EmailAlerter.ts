import { IAlerter } from '../IAlerter';
import { EmailAlerterConfig } from '../../config/schema';
import { Message, SMTPClient } from 'emailjs';

export class EmailAlerter implements IAlerter {
    public client: SMTPClient;
    public from: string;
    public to: string;
    public subject?: string;

    public constructor(config: EmailAlerterConfig) {
        this.client = new SMTPClient({
            user: config.auth.user,
            password: config.auth.pass,
            host: config.host,
            ssl: config.secure,
        });
        this.from = config.message.from;
        this.to = config.message.to;
        this.subject = config.message.subject;
        this.testConfig(config.auth.user);
    }

    public async alert(message: string): Promise<boolean> {
        try {
            const messageClient = new Message({
                text: message,
                from: this.from,
                to: this.to,
                subject: this.subject ? this.subject : '',
            });
            await this.client.sendAsync(messageClient);
        } catch (error) {
            console.log(`Email alert error: ${error}`);
        }
        return true;
    }

    private async testConfig(user: string): Promise<void> {
        try {
            const message = new Message({
                text: 'Heimdall initialized!',
                from: this.from,
                to: this.to,
                subject: this.subject ? this.subject : '',
            });
            await this.client.sendAsync(message);
        } catch (error) {
            console.log(`Email alert error: ${error}`);
            return;
        }
        console.log(`Email alerts initialized for ${user}`);
        return;
    }
}
