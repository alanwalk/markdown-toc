import {
    Range,
} from 'vscode'

export class Header {
    line: number;
    depth: number;
    title: string;
    hash: string;
    range: Range;
    header: string;
    orderedList: string;
    baseTitle: string;

    constructor(line: number, depth: number, title: string, hash: string, range: Range, header: string, orderedList: string, baseTitle: string) {
        this.line = line;
        this.depth = depth;
        this.title = title;
        this.hash = hash;
        this.range = range;
        this.header = header;
        this.orderedList = orderedList;
        this.baseTitle = baseTitle;
    }
}