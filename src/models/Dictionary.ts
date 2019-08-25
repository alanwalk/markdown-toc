export class Dictionary {
    key: string;
    lowerCaseKey: string;
    value: any;

    constructor(key: string, value: string | number | string[] | boolean) {
        this.key = key;
        this.lowerCaseKey = key.toLocaleLowerCase();
        this.value = value;
    }
}