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
            port: {
                type: Number,
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
        },
    },
});

export type TelegramAlerter = {
    botToken: string;
    chatId: string;
};

export type EmailAlerter = {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
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
    alert: TelegramAlerter | EmailAlerter;
};
