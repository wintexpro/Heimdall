export class TemplateManager {
    public templateString: string;

    public constructor(templateString: string) {
        this.templateString = templateString;
    }

    public async template(lokiRoundtripResult: string[][]): Promise<string> {
        let message = '';
        console.log(this.templateString);
        if (this.templateString) {
            for (const lokiResult of lokiRoundtripResult) {
                let templateMessage = this.templateString;
                if (lokiResult[1]) {
                    try {
                        const values = JSON.parse(lokiResult[1]);
                        for (const key in values) {
                            const elementId = templateMessage.indexOf(`{${key}}`);
                            if (elementId !== -1) {
                                templateMessage = `${templateMessage.replace(`{${key}}`, values[key])}`;
                            }
                            console.log(templateMessage);
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
