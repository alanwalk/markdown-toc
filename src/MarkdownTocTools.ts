import {
    window,
    Position,
    Range,
    TextEditorEdit,
    TextDocument
} from 'vscode';
import { Header } from "./models/Header";
import { ConfigManager } from './configManager';

export class MarkdownTocTools {

    configManager = new ConfigManager();

    // Public function
    public updateMarkdownToc(isBySave: boolean = false) {
        let markdownTocTools = this;
        let editor = window.activeTextEditor;

        if (editor == undefined) {
            return false;
        }

        let insertPosition = editor.selection.active;

        editor.edit(function (editBuilder) {
            let tocRange = markdownTocTools.getTocRange();
            markdownTocTools.updateOptions(tocRange);
            if (isBySave && ((!markdownTocTools.configManager.options.UPDATE_ON_SAVE) || (tocRange == null)))
                return false;
            // save options, and delete last insert
            if (tocRange != null) {
                insertPosition = tocRange.start;
                editBuilder.delete(tocRange);
                markdownTocTools.deleteAnchor(editBuilder);
            }

            let headerList = markdownTocTools.getheaderList();

            markdownTocTools.createToc(editBuilder, headerList, insertPosition);
            markdownTocTools.insertAnchor(editBuilder, headerList);
        });

        return true;
    }

    public deleteMarkdownToc() {
        let markdownTocTools = this;
        let editor = window.activeTextEditor;
        if (editor == undefined) {
            return false;
        }
        editor.edit(function (editBuilder) {
            let tocRange = markdownTocTools.getTocRange();
            if (tocRange == null)
                return;
            editBuilder.delete(tocRange);
            markdownTocTools.deleteAnchor(editBuilder);
        });
    }
    public updateMarkdownSections() {
        let tocRange = this.getTocRange();
        this.updateOptions(tocRange);
        let headerList = this.getheaderList();
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    editBuilder.replace(element.range, element.fullHeaderWithOrder);
                });
            });
        }
    }
    public deleteMarkdownSections() {
        let tocRange = this.getTocRange();
        this.updateOptions(tocRange);
        let headerList = this.getheaderList();
        let editor = window.activeTextEditor;
        if (editor != undefined && headerList != undefined) {
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    editBuilder.replace(element.range, element.fullHeaderWithoutOrder);
                });
            });
        }
    }
    public notifyDocumentSave() {
        // Prevent save again
        if (this.configManager.options.saveBySelf) {
            this.configManager.options.saveBySelf = false;
            return;
        }
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            let doc = editor.document;
            if (doc.languageId != 'markdown')
                return;
            if (this.updateMarkdownToc(true)) {
                doc.save();
                this.configManager.options.saveBySelf = true;
            }
        }
    }

    // Private function
    private getTocRange() {
        let editor = window.activeTextEditor;
        if (editor == undefined) {
            return null;
        }
        let doc = editor.document;
        let start, stop: Position | undefined;
        for (let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;
            if ((start == null) && (lineText.match(this.configManager.optionKeys.REGEXP_TOC_START))) {
                start = new Position(index, 0);
            }
            else if (lineText.match(this.configManager.optionKeys.REGEXP_TOC_STOP)) {
                stop = new Position(index, lineText.length);
                break;
            }
        }
        if ((start != null) && (stop != null)) {
            return new Range(start, stop);
        }
        return null;
    }
    private updateOptions(tocRange: Range | null) {
        this.configManager.loadConfigurations();
        this.configManager.loadCustomOptions(tocRange);
    }
    private insertAnchor(editBuilder: TextEditorEdit, headerList: any[]) {
        if (!this.configManager.options.INSERT_ANCHOR.value) {
            return
        };

        headerList.forEach(element => {
            let name = element.hash.match(this.configManager.optionKeys.REGEXP_ANCHOR)[1];
            let text = ['<a id="markdown-', name, '" name="', name, '"></a>\n'];
            let insertPosition = new Position(element.line, 0);
            editBuilder.insert(insertPosition, text.join(''));
        });
    }
    private deleteAnchor(editBuilder: TextEditorEdit) {
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            let doc = editor.document;
            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;
                if (lineText.match(this.configManager.optionKeys.REGEXP_MARKDOWN_ANCHOR) == null)
                    continue;
                let range = new Range(new Position(index, 0), new Position(index + 1, 0));
                editBuilder.delete(range);
            }
        }
    }

    private createToc(editBuilder: TextEditorEdit, headerList: Header[], insertPosition: Position) {

        let text: string[] = [];

        //// TOC STAT
        // TODO: the custom option IS inside the toc start. need to split
        text = text.concat(this.generateTocStartIndicator());

        //// HEADERS
        let indicesOfDepth = this.getIndiceOfDepth();
        let waitResetList = Array.apply(null, new Array(indicesOfDepth.length)).map(Boolean.prototype.valueOf, false);
        let minDepth = 6;

        headerList.forEach(element => {
            minDepth = Math.min(element.depth, minDepth);
        });

        let startDepth = Math.max(minDepth, this.configManager.options.DEPTH_FROM.value);

        headerList.forEach(element => {
            if (element.depth <= this.configManager.options.DEPTH_TO.value) {
                let length = element.depth - startDepth;
                for (var index = 0; index < waitResetList.length; index++) {
                    if (waitResetList[index] && (length < index)) {
                        indicesOfDepth[index] = 0;
                        waitResetList[index] = false;
                    }
                }

                let row = [
                    this.configManager.tab.repeat(length),
                    this.configManager.options.ORDERED_LIST.value ? (++indicesOfDepth[length] + '. ') : '- ',
                    this.configManager.options.WITH_LINKS.value ? element.hash : element.dirtyHeaderWithoutHeaderMark
                ];

                text.push(row.join(''));
                waitResetList[length] = true;
            }
        });

        //// TOC END
        text.push(this.configManager.lineEnding + "<!-- /TOC -->");

        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.lineEnding));
    }

    private generateTocStartIndicator() {
        let tocStartIndicator: string[] = [];

        tocStartIndicator.push('<!-- TOC ');

        // custom options
        this.configManager.options.optionsFlag.forEach(optionKey => {
            if (this.configManager.options.optionsFlag.indexOf(optionKey) != -1) {
                tocStartIndicator.push(optionKey + ':' + this.configManager.options.getOptionValueByKey(optionKey) + ' ');
            }
        });

        tocStartIndicator.push('-->' + this.configManager.lineEnding);

        return tocStartIndicator.join('');
    }

    private getIndiceOfDepth() {
        return Array.apply(null, new Array(this.configManager.options.DEPTH_TO.value - this.configManager.options.DEPTH_FROM.value + 1)).map(Number.prototype.valueOf, 0);
    }

    private getheaderList() {
        let headerList: Header[] = [];
        let editor = window.activeTextEditor;

        if (editor != undefined) {
            let doc = editor.document;

            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = this.getNextLineIsNotInCode(index, doc);

                let header = this.getheader(lineText);

                if (header.isHeader) {
                    header.orderArray = this.calculateHeaderOrder(header, headerList);
                    header.range = new Range(index, 0, index, lineText.length);
                    headerList.push(header);
                }
            }
        }

        return headerList;
    }

    private getNextLineIsNotInCode(index: number, doc: TextDocument) {
        let lineText = doc.lineAt(index).text;

        let isCodeStyle1 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK1) != null;
        let isCodeStyle2 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK2) != null;

        let nextIndex = index;

        while (isCodeStyle1 || isCodeStyle2) {
            nextIndex = index + 1;

            let nextLine = doc.lineAt(nextIndex).text;

            isCodeStyle1 = nextLine.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK1) != null;
            isCodeStyle2 = nextLine.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK2) != null;
        }

        return doc.lineAt(nextIndex).text;
    }

    private getheader(lineText: string) {
        let header = new Header(this.configManager.options.ANCHOR_MODE.value);

        let headerTextSplit = lineText.match(this.configManager.optionKeys.REGEXP_HEADER_META);

        if (headerTextSplit != null) {
            header.headerMark = headerTextSplit[1];
            header.orderedListString = headerTextSplit[2];
            header.dirtyTitle = headerTextSplit[4];
        }

        return header;
    }

    private calculateHeaderOrder(headerBeforePushToList: Header, headerList: Header[]) {

        if(headerList.length == 0) {
            // special case: First header with depth = 1
            return [1];
        }

        let lastheaderInList = headerList[headerList.length - 1];

        if (headerBeforePushToList.depth < lastheaderInList.depth) {
            // continue of the parent level
            let previousheader = headerList.find(header => header.depth == headerBeforePushToList.depth);
            
            if(previousheader != undefined) {
                let orderArray = Object.assign([], previousheader.orderArray);
                orderArray[orderArray.length - 1]++;

                return orderArray;
            }
        }

        if(headerBeforePushToList.depth > lastheaderInList.depth) {
            // child level of previous
            // order start with 1
            let orderArray = Object.assign([], lastheaderInList.orderArray);
            orderArray.push(1);

            return orderArray;
        }

        if(headerBeforePushToList.depth == lastheaderInList.depth) {
            // the same level, increase last item in orderArray
            let orderArray = Object.assign([], lastheaderInList.orderArray);
                orderArray[orderArray.length - 1]++;

                return orderArray;
        }

        return [];
    }

    dispose() {
    }
}
