import { TemplateConfig } from '../config/schema';

export class Templater {
    public text: string;

    public constructor(config: TemplateConfig) {
        this.text = config.text;
    }

    public async template(lokiRoundtripResult: string[][]): Promise<string> {
        let message = '';
        if (this.text) {
            for (const lokiResult of lokiRoundtripResult) {
                let templateMessage = this.text;
                if (lokiResult[1]) {
                    try {
                        const values = JSON.parse(lokiResult[1]);
                        for (const key in values) {
                            const elementId = templateMessage.indexOf(`{${key}}`);
                            if (elementId !== -1) {
                                templateMessage = `${templateMessage.replace(`{${key}}`, values[key])}`;
                            }
                        }
                        message += `${this.buildMessageFromLokiData(lokiResult[0], templateMessage)}\n`;
                    } catch (error) {
                        console.log(`Parse error: ${error}`);
                    }
                }
            }
            return message;
        }
        for (const lokiResult of lokiRoundtripResult) {
            if (lokiResult[1]) {
                message += `${this.buildMessageFromLokiData(lokiResult[0], lokiResult[1])}\n`;
            }
        }
        return message;
    }

    private buildMessageFromLokiData(messageTime: string, messageText: string): string {
        return `${new Date(parseInt(messageTime) / 1000000)}: ${messageText}`;
    }
}
