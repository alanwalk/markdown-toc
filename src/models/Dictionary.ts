export class Dictionary {
    key: string;
    lowerCaseKey: string;
    workspaceValue: any;
    uniqueValue: any;

    constructor(key: string, defaultWorkspaceValue: string | number | string[] | boolean) {
        this.key = key;
        this.lowerCaseKey = key.toLocaleLowerCase();
        this.workspaceValue = defaultWorkspaceValue;
    }

    public get value() {
        if (this.uniqueValue != undefined) {
            return this.uniqueValue;
        }

        return this.workspaceValue;
    }
}