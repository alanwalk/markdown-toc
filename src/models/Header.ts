import {
    Range
} from 'vscode';
import { AnchorMode } from './AnchorMode';

export class Header {
    headerMark: string = "";
    orderedListString: string = "";
    dirtyTitle:string = "";
    range: Range;

    orderArray:number[] = [];

    anchorMode: AnchorMode = AnchorMode.github;

    constructor(anchorMode: AnchorMode) {
        this.anchorMode = anchorMode;
        this.range = new Range(0, 0, 0, 0);
    }

    public get depth(): number {
        return this.headerMark.length;
    }

    public get isHeader(): boolean {
        return this.headerMark != "";
    }

    public hash(tocString: string): string {
        let title = this.cleanUpTitle(tocString);
        let hashMap: any = {};

        if (hashMap[title] == null) {
            hashMap[title] = 0;
        }
        else {
            hashMap[title] += 1;
        }

        return this.getHash(title, this.anchorMode, hashMap[title]);
    }

    public get tocWithoutOrder(): string {
        return this.dirtyTitle;
    }

    public get tocWithOrder(): string {
        return this.orderArray.join('.') + ". " + this.tocWithoutOrder;
    }

    public get fullHeaderWithOrder():string {
        return this.headerMark + " " + this.tocWithOrder;
    }

    public get fullHeaderWithoutOrder():string{
        return this.headerMark + " " + this.tocWithoutOrder;
    }

    private getHash(headername: string, mode: AnchorMode, repetition: number) {
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
