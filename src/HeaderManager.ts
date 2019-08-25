import { Header } from "./models/Header";
import { ConfigManager } from "./ConfigManager";
import { TextDocument, window, Range } from "vscode";

export class HeaderManager {

    configManager = new ConfigManager();

    public getHeader(lineText: string) {
        let header = new Header(this.configManager.options.ANCHOR_MODE.value);

        let headerTextSplit = lineText.match(this.configManager.regexStrings.REGEXP_HEADER_META);

        if (headerTextSplit != null) {
            header.headerMark = headerTextSplit[1];
            header.orderedListString = headerTextSplit[2];
            header.dirtyTitle = headerTextSplit[4];
        }

        return header;
    }

    public getHeaderList() {
        let headerList: Header[] = [];
        let editor = window.activeTextEditor;

        if (editor != undefined) {
            let doc = editor.document;

            for (let index = 0; index < doc.lineCount; index++) {
                index = this.getNextLineIndexIsNotInCode(index, doc);

                if (index == doc.lineCount) {
                    break;
                }

                let lineText = doc.lineAt(index).text;

                let header = this.getHeader(lineText);

                if (header.isHeader) {
                    header.orderArray = this.calculateHeaderOrder(header, headerList);
                    header.range = new Range(index, 0, index, lineText.length);

                    if (header.depth <= this.configManager.options.DEPTH_TO.value) {
                        headerList.push(header);
                    }
                }
            }

            // violation of clean code
            this.detectAutoOrderedHeader(headerList);
        }

        return headerList;
    }

    private detectAutoOrderedHeader(headerList: Header[]) {

        this.configManager.options.isOrderedListDetected = false;

        for (let index = 0; index < headerList.length; index++) {
            if (headerList[index].orderedListString != undefined && headerList[index].orderedListString != '') {
                this.configManager.options.isOrderedListDetected = true;
                break;
            }
        }
    }

    public getNextLineIndexIsNotInCode(index: number, doc: TextDocument) {
        if (this.isLineStartOrEndOfCodeBlock(index, doc) && index < doc.lineCount - 1) {
            index = index + 1;

            while (this.isLineStartOrEndOfCodeBlock(index, doc) == false && index < doc.lineCount - 1) {
                index = index + 1;
            }
            return index + 1;
        }

        return index;
    }

    private isLineStartOrEndOfCodeBlock(lineNumber: number, doc: TextDocument) {
        let nextLine = doc.lineAt(lineNumber).text;

        let isCodeStyle1 = nextLine.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK1) != null;
        let isCodeStyle2 = nextLine.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK2) != null;

        return isCodeStyle1 || isCodeStyle2;
    }

    public calculateHeaderOrder(headerBeforePushToList: Header, headerList: Header[]) {

        if (headerList.length == 0) {
            // special case: First header
            let orderArray = new Array(headerBeforePushToList.depth);
            orderArray[headerBeforePushToList.depth - 1] = 1;
            return orderArray;
        }

        let lastheaderInList = headerList[headerList.length - 1];

        if (headerBeforePushToList.depth < lastheaderInList.depth) {
            // continue of the parent level

            let previousheader = undefined;

            for (let index = headerList.length - 1; index >= 0; index--) {
                if (headerList[index].depth == headerBeforePushToList.depth) {
                    previousheader = headerList[index];
                    break;
                }
            }

            if (previousheader != undefined) {
                let orderArray = Object.assign([], previousheader.orderArray);
                orderArray[orderArray.length - 1]++;

                return orderArray;
            } else {
                // special case: first header has greater level than second header
                let orderArray = new Array(headerBeforePushToList.depth);
                orderArray[headerBeforePushToList.depth - 1] = 1;
                return orderArray;
            }
        }

        if (headerBeforePushToList.depth > lastheaderInList.depth) {
            // child level of previous
            // order start with 1
            let orderArray = Object.assign([], lastheaderInList.orderArray);
            orderArray.push(1);

            return orderArray;
        }

        if (headerBeforePushToList.depth == lastheaderInList.depth) {
            // the same level, increase last item in orderArray
            let orderArray = Object.assign([], lastheaderInList.orderArray);
            orderArray[orderArray.length - 1]++;

            return orderArray;
        }

        return [];
    }
}