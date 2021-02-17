import { StreamValue } from '../loki/types';

export class TemplateManager {
    public templateString: string;

    public constructor(templateString: string) {
        this.templateString = templateString;
    }

    public async template(lokiRoundtripResult: StreamValue[]): Promise<string> {
        let message = '';
        if (this.templateString) {
            for (const lokiResult of lokiRoundtripResult) {
                const braceRegex = /{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}/gi;
                if (lokiResult[1]) {
                    try {
                        const values = JSON.parse(lokiResult[1]);
                        const templatedString = this.templateString.replace(braceRegex, (_, key) => {
                            let result = values;
                            for (const property of key.split('.')) {
                                result = result ? result[property] : '';
                            }
                            return String(result);
                        });
                        message += `${this.buildMessageFromLokiData(lokiResult[0], templatedString)}\n`;
                    } catch (error) {
                        console.log(`json parse error`);
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
