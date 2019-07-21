export class HeaderMeta {
    headerMark: string = "";
    orderedListString: string = "";
    // title without ordered number
    baseTitle: string = "";


    public get depth(): number {
        return this.headerMark.length;
    }

    public get isHeader(): boolean {
        return this.headerMark != "";
    }
}
