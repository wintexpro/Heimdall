import { IAlerter } from '../IAlerter';
import { TelegramAlerterConfig } from '../../config/schema';
import fetch from 'node-fetch';

export class TelegramAlerter implements IAlerter {
    public apiUrl: string;
    public chatId: string;

    public constructor(config: TelegramAlerterConfig) {
        this.apiUrl = `https://api.telegram.org/bot${config.botToken}`;
        this.chatId = config.chatId;
        this.testConfig();
    }

    public async alert(lokiRoundtripResult: string[][]): Promise<boolean> {
        let text = '';
        for (const lokiResult of lokiRoundtripResult) {
            if (lokiResult[1]) {
                text += `${this.buildMessageFromLokiData(lokiResult)}\n`;
            }
        }
        if (text.length > 0) {
            const response: any = await (
                await fetch(`${this.apiUrl}/sendMessage`, {
                    method: 'post',
                    body: JSON.stringify({
                        chat_id: this.chatId,
                        text,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                })
            ).json();
            if (!response.ok) {
                console.log(`telegram alert ${response.description}`);
            }
            return response.ok as boolean;
        } else {
            return true;
        }
    }

    private async testConfig(): Promise<void> {
        const meResponse: any = await (await fetch(`${this.apiUrl}/getMe`)).json();
        if (!meResponse.ok) {
            console.log('telegram error: check your bot token');
            process.exit(1);
        }
        const chatResponse: any = await (
            await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'post',
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: 'Heimdall initialized!',
                }),
                headers: { 'Content-Type': 'application/json' },
            })
        ).json();
        if (!chatResponse.ok) {
            console.log('telegram error: chat not found');
            process.exit(1);
        }
        console.log(`telegram alerts initialized for ${meResponse.result.username}`);
        return;
    }

    public buildMessageFromLokiData(message: string[]): string {
        return `${new Date(parseInt(message[0]) / 1000000)}: ${message[1]}`;
    }
}
