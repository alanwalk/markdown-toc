import {
    Range
} from 'vscode';

export class Header {
    headerMark: string = "";
    orderedListString: string = "";
    // title without ordered number
    // baseTitle: string = "";
    dirtyTitle:string = "";
    range: Range;

    orderArray:number[] = [];

    anchorMode: string = "";

    constructor(anchorMode: string) {
        this.anchorMode = anchorMode;
        this.range = new Range(0, 0, 0, 0);
    }

    public get depth(): number {
        return this.headerMark.length;
    }

    public get isHeader(): boolean {
        return this.headerMark != "";
    }

    public get hash(): string {
        let title = this.cleanUpTitle(this.dirtyHeaderWithoutHeaderMark);
        let hashMap: any = {};

        if (hashMap[title] == null) {
            hashMap[title] = 0;
        }
        else {
            hashMap[title] += 1;
        }

        return this.getHash(title, this.anchorMode, hashMap[title]);
    }

    public get fullHeaderWithOrder():string {
        return this.headerMark + " " + this.orderArray.join('.') + ". " + this.dirtyTitle;
    }

    public get fullHeaderWithoutOrder():string{
        return this.headerMark + " " + this.dirtyTitle;
    }

    public get dirtyHeaderWithoutHeaderMark():string{
        return this.orderedListString + " " + this.dirtyTitle;
    }

    private getHash(headername: string, mode: string, repetition: number) {
        let anchor = require('anchor-markdown-header');
        return decodeURI(anchor(headername, mode, repetition));
    }

    private cleanUpTitle(dirtyTitle: string) {
        let title = dirtyTitle.replace(/\[(.+)]\([^)]*\)/gi, "$1"); // replace link
        title = title.replace(/<!--.+-->/gi, ""); // replace comment
        title = title.replace(/\#*_/gi, "").trim(); // replace special char
        return title;
    }
}
