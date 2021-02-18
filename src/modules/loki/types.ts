export type LokiConfig = {
    host: string;
    port: number;
    poll: {
        every: string;
        label: string[];
    };
    aggregation: {
        key: string;
        limit: number;
        timeFrame: string;
    };
};

// result data from Loki (when resultType = "streams")
export type LokiStreamResult = {
    stream: Record<string, string>;
    values: StreamValue[];
};

/**
 * Log result from Loki looks like tuple [<string: nanosecond unix epoch>, <string: log line>]
 * @link https://grafana.com/docs/loki/latest/api/#matrix-vector-and-streams
 */
export type StreamValue = [string, string];
