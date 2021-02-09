import Schema from 'validate';

export const configValidator = new Schema({
    loki: {
        host: {
            type: String,
            required: true,
        },
        port: {
            type: Number,
            required: true,
        },
    },
    poll: {
        every: {
            type: String,
            required: true,
            use: {
                timeStr: (val) => /^[0-9]*m$/.test(val),
            },
            message: {
                timeStr: (path) => `${path} must be a time string (minutes only). ex: 5m, 10m`,
            },
        },
        label: {
            type: Array,
            each: {
                type: String,
                use: {
                    labelStr: (val) => /^\S+:\S+$/.test(val),
                },
                message: {
                    labelStr: (path) => `${path} must be a label:value string. ex [level:error, status:404] `,
                },
            },
            required: true,
        },
    },
    alert: {
        telegram: {
            botToken: {
                type: String,
            },
            chatId: {
                type: String,
            },
        },
        email: {
            host: {
                type: String,
            },
            secure: {
                type: Boolean,
            },
            auth: {
                user: {
                    type: String,
                },
                pass: {
                    type: String,
                },
            },
            message: {
                from: {
                    type: String,
                },
                to: {
                    type: String,
                },
                subject: {
                    type: String,
                },
            },
        },
    },
    template: {
        text: {
            type: String,
        },
    },
});

export type TelegramAlerterConfig = {
    botToken: string;
    chatId: string;
};

export type TemplateConfig = {
    text: string;
};

export type EmailAlerterConfig = {
    host: string;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    message: {
        from: string;
        to: string;
        subject?: string;
    };
};

export type Config = {
    loki: {
        host: string;
        port: number;
    };
    poll: {
        every: string;
        label: string[];
    };
    alert: {
        email: EmailAlerterConfig;
    } & {
        telegram: TelegramAlerterConfig;
    };
    template: {
        text: string;
    };
};
