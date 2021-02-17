import { IAlerter } from '../IAlerter';
import { WebhookAlerterConfig } from '../../config/schema';
import fetch from 'node-fetch';
import { StreamValue } from 'src/modules/loki/types';

export class WebhookAlerter implements IAlerter {
    public webhookUrl: string;
    public headers: Record<string, string>;

    public constructor(config: WebhookAlerterConfig) {
        this.webhookUrl = `${config.webhookUrl}`;
        this.headers = { 'Content-Type': 'application/json' };
        if (config.headers) {
            for (const header of config.headers) {
                const headerParts = header.split(':');
                this.headers[headerParts[0]] = headerParts[1];
            }
        }
    }

    public async alert(message: string, rawData: StreamValue[]): Promise<boolean> {
        if (message.length > 0) {
            await fetch(this.webhookUrl, {
                method: 'post',
                body: JSON.stringify({ result: rawData }),
                headers: this.headers,
            }).catch((e) => console.log(`webhook alert error: ${e.message}`));
        }
        return true;
    }
}
