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
                let lineText = this.getNextLineIsNotInCode(index, doc);

                let header = this.getHeader(lineText);

                if (header.isHeader) {
                    header.orderArray = this.calculateHeaderOrder(header, headerList);
                    header.range = new Range(index, 0, index, lineText.length);

                    if (header.depth <= this.configManager.options.DEPTH_TO.value) {
                        headerList.push(header);
                    }
                }
            }
        }

        return headerList;
    }

    // private isHeaderValid(header: Header, headerList: Header[]) {
    //     if (header.depth <= this.configManager.options.DEPTH_TO.value) {
    //         if (this.configManager.options.ANCHOR_MODE.value == AnchorMode.github) {
    //             if (header.depth == 1 && headerList.length == 0) {
    //                 return false;
    //             }

    //             return true;
    //         }
    //     }

    //     return false;
    // }

    public getNextLineIsNotInCode(index: number, doc: TextDocument) {
        let lineText = doc.lineAt(index).text;

        let isCodeStyle1 = lineText.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK1) != null;
        let isCodeStyle2 = lineText.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK2) != null;

        let nextIndex = index;

        while ((isCodeStyle1 || isCodeStyle2) && index < doc.lineCount - 1) {
            nextIndex = index + 1;

            let nextLine = doc.lineAt(nextIndex).text;

            isCodeStyle1 = nextLine.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK1) != null;
            isCodeStyle2 = nextLine.match(this.configManager.regexStrings.REGEXP_CODE_BLOCK2) != null;
        }

        return doc.lineAt(nextIndex).text;
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