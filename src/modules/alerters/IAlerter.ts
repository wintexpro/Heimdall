export interface IAlerter {
    alert(lokiResult: string[][]): Promise<boolean>; // loki parsed result is an array of array with [0] = timestamp nanoseconds, [1] = parsed value
    buildMessageFromLokiData(message: string[]): string;
}
