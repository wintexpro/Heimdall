export interface IAlerter {
    alert(message: string): Promise<boolean>; // loki parsed result is an array of array with [0] = timestamp nanoseconds, [1] = parsed value
}
