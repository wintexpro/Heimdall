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
                    labelStr: (path) => `${path} must be a label:value string. ex [level:error, status:404]`,
                },
            },
            required: true,
        },
    },
    alert: {
        telegram: {
            botToken: {
                use: {
                    requiredIfParentDefined: (val: string, ctx: any) => {
                        if (ctx.alert.telegram && val) {
                            return true;
                        }
                        if (ctx.alert.telegram === undefined) {
                            return true;
                        }
                        return false;
                    },
                },
                message: {
                    requiredIfParentDefined: (path) => `if telegram is defined, ${path} must be defined too`,
                },
                type: String,
            },
            chatId: {
                use: {
                    requiredIfParentDefined: (val: string, ctx: any) => {
                        if (ctx.alert.telegram && val) {
                            return true;
                        }
                        if (ctx.alert.telegram === undefined) {
                            return true;
                        }
                        return false;
                    },
                },
                message: {
                    requiredIfParentDefined: (path) => `if telegram is defined, ${path} must be defined too`,
                },
                type: String,
            },
        },
        webhook: {
            url: {
                use: {
                    requiredIfParentDefined: (val: string, ctx: any) => {
                        if (ctx.alert.webhook && val) {
                            return true;
                        }
                        if (ctx.alert.webhook === undefined) {
                            return true;
                        }
                        return false;
                    },
                },
                message: {
                    requiredIfParentDefined: (path) => `if webhook is defined, ${path} must be defined too`,
                },
                type: String,
            },
            headers: {
                type: Array,
                each: {
                    type: String,
                    use: {
                        labelStr: (val: string, ctx: any) => {
                            if (ctx.alert.email && val) {
                                return /^\S+:\S+$/.test(val);
                            }
                            if (ctx.alert.email === undefined) {
                                return true;
                            }
                            return false;
                        },
                    },
                    message: {
                        labelStr: (path) =>
                            `${path} must be a header:value string. ex [Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l]`,
                    },
                },
            },
        },
        slack: {
            webhookUrl: {
                use: {
                    requiredIfParentDefined: (val: string, ctx: any) => {
                        if (ctx.alert.slack && val) {
                            return true;
                        }
                        if (ctx.alert.slack === undefined) {
                            return true;
                        }
                        return false;
                    },
                },
                message: {
                    requiredIfParentDefined: (path) => `if slack is defined, ${path} must be defined too`,
                },
                type: String,
            },
        },
        email: {
            host: {
                type: String,
                use: {
                    requiredIfParentDefined: (val: string, ctx: any) => {
                        if (ctx.alert.email && val) {
                            return true;
                        }
                        if (ctx.alert.email === undefined) {
                            return true;
                        }
                        return false;
                    },
                },
                message: {
                    requiredIfParentDefined: (path) => `if email is defined, ${path} must be defined too`,
                },
            },
            secure: {
                type: Boolean,
            },
            auth: {
                user: {
                    type: String,
                    use: {
                        requiredIfParentDefined: (val: string, ctx: any) => {
                            if (ctx.alert.email && val) {
                                return true;
                            }
                            if (ctx.alert.email === undefined) {
                                return true;
                            }
                            return false;
                        },
                    },
                    message: {
                        requiredIfParentDefined: (path) => `if email.auth is defined, ${path} must be defined too`,
                    },
                },
                pass: {
                    type: String,
                    use: {
                        requiredIfParentDefined: (val: string, ctx: any) => {
                            if (ctx.alert.email && val) {
                                return true;
                            }
                            if (ctx.alert.email === undefined) {
                                return true;
                            }
                            return false;
                        },
                    },
                    message: {
                        requiredIfParentDefined: (path) => `if email.auth is defined, ${path} must be defined too`,
                    },
                },
            },
            message: {
                from: {
                    use: {
                        emailFormat: (val, ctx: any) =>
                            ctx.alert.email
                                ? /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(val)
                                : true,
                    },
                    message: {
                        emailFormat: (path) => `${path} must be valid email`,
                    },
                    type: String,
                },
                to: {
                    use: {
                        emailFormat: (val, ctx: any) =>
                            ctx.alert.email
                                ? /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(val)
                                : true,
                    },
                    message: {
                        emailFormat: (path) => `${path} must be valid email`,
                    },
                    type: String,
                },
                subject: {
                    type: String,
                },
            },
        },
        templateString: {
            type: String,
        },
    },
    aggregation: {
        key: {
            type: String,
            use: {
                requiredIfParentDefined: (val: string, ctx: any) => {
                    if (ctx.aggregation && val) {
                        return true;
                    }
                    if (ctx.aggregation === undefined) {
                        return true;
                    }
                    return false;
                },
            },
            message: {
                requiredIfParentDefined: (path) => `if aggregation is defined, ${path} must be defined too`,
            },
        },
        limit: {
            required: false,
            type: Number,
            use: {
                isPositiveInteger: (val: number, ctx: any) => {
                    return val !== undefined ? val > 0 && Number.isInteger(val) : true;
                },
            },
            message: {
                isPositiveInteger: (path) => `${path} must be a positive integer number`,
            },
        },
        timeFrame: {
            type: String,
            use: {
                timeStr: (val: string, ctx: any) => {
                    if (ctx.aggregation && val) {
                        return /^[0-9]*m$/.test(val);
                    }
                    if (ctx.aggregation === undefined) {
                        return true;
                    }
                    return false;
                },
            },
            message: {
                timeStr: (path) => `${path} must be a time string (minutes only). ex: 5m, 10m`,
            },
        },
    },
});

export type WebhookAlerterConfig = {
    url: string;
    headers: string[];
};

export type TelegramAlerterConfig = {
    botToken: string;
    chatId: string;
};

export type SlackAlerterConfig = {
    webhookUrl: string;
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
    aggregation: {
        key: string;
        limit: number;
        timeFrame: string;
    };
    alert: {
        email: EmailAlerterConfig;
    } & {
        webhook: WebhookAlerterConfig;
    } & {
        telegram: TelegramAlerterConfig;
    } & {
        slack: SlackAlerterConfig;
    } & {
        templateString?: string;
    };
};
