import {
    window,
    workspace,
    Position,
    Range,
    TextEditorEdit,
    TextDocument
} from 'vscode';
import { Header } from './models/Header';
import { HeaderMeta } from "./models/HeaderMeta";
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
            let headerList = markdownTocTools.getHeaderList();

            let headerMetaList = markdownTocTools.getHeaderMetaList();

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
        let headerList = this.getHeaderList();
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    let newHeader = element.header + " " + element.orderedList + " " + element.baseTitle;
                    editBuilder.replace(element.range, newHeader);
                });
            });
        }
    }
    public deleteMarkdownSections() {
        let tocRange = this.getTocRange();
        this.updateOptions(tocRange);
        let headerList = this.getHeaderList();
        let editor = window.activeTextEditor;
        if (editor != undefined && headerList != undefined) {
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    let newHeader = element.header + " " + element.baseTitle;
                    editBuilder.replace(element.range, newHeader);
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

    private createToc(editBuilder: TextEditorEdit, headerList: any[], insertPosition: Position) {

        let optionsText = [];

        optionsText.push('<!-- TOC ');

        this.configManager.options.optionsFlag.forEach(optionKey => {
            if (this.configManager.options.optionsFlag.indexOf(optionKey) != -1) {
                optionsText.push(optionKey + ':' + this.configManager.options.getOptionValueByKey(optionKey) + ' ');
            }
        });

        optionsText.push('-->' + this.configManager.lineEnding);

        let text = [];
        text.push(optionsText.join(''));

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
                    this.configManager.options.WITH_LINKS.value ? element.hash : element.title
                ];
                text.push(row.join(''));
                waitResetList[length] = true;
            }
        });
        text.push(this.configManager.lineEnding + "<!-- /TOC -->");
        editBuilder.insert(insertPosition, text.join(this.configManager.lineEnding));
    }

    private getIndiceOfDepth() {
        return Array.apply(null, new Array(this.configManager.options.DEPTH_TO.value - this.configManager.options.DEPTH_FROM.value + 1)).map(Number.prototype.valueOf, 0);
    }

    private getHeaderMetaList() {
        let headerMetaList:HeaderMeta[] = [];
        let editor = window.activeTextEditor;

        if(editor != undefined) {
            let doc = editor.document;
            
            for(let index = 0;index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;

                let headerMeta = this.getHeaderMeta(lineText);

                if(headerMeta.isHeader()){
                    headerMetaList.push(headerMeta);
                }
            }
        }

        return headerMetaList;
    }

    private getHeaderList() {
        let headerList: Header[] = [];
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            let doc = editor.document;
            let hashMap: any = {};
            // let isInCode = 0;
            let indicesOfDepth = Array.apply(null, new Array(6)).map(Number.prototype.valueOf, 0);

            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;

                // let codeResult1 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK1);
                // let codeResult2 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK2);

                // if (isInCode == 0) {
                //     isInCode = codeResult1 != null ? 1 : (codeResult2 != null ? 2 : isInCode);
                // }
                // else if (isInCode == 1) {
                //     isInCode = codeResult1 != null ? 0 : isInCode;
                // }
                // else if (isInCode == 2) {
                //     isInCode = codeResult2 != null ? 0 : isInCode;
                // }
                // if (isInCode)
                //     continue;

                index = this.getNextLineIndexIsNotInCode(index, lineText, doc);

                let headerResult = lineText.match(this.configManager.optionKeys.REGEXP_HEADER);
                if (headerResult == null)
                    continue;
                let depth = headerResult[1].length;
                if (depth < this.configManager.options.DEPTH_FROM.value)
                    continue;
                if (depth > this.configManager.options.DEPTH_TO.value)
                    continue;
                if (lineText.match(this.configManager.optionKeys.REGEXP_IGNORE_TITLE))
                    continue;
                for (var i = depth; i <= this.configManager.options.DEPTH_TO.value; i++) {
                    indicesOfDepth[depth] = 0;
                }
                indicesOfDepth[depth - 1]++;
                let orderedListStr = "";
                for (var i = this.configManager.options.DEPTH_FROM.value - 1; i < depth; i++) {
                    orderedListStr += indicesOfDepth[i].toString() + ".";
                }
                let title = lineText.substr(depth).trim();
                let baseTitle = title.replace(/^(?:\d+\.)+/, "").trim(); // title without section number
                title = this.cleanUpTitle(title);
                if (hashMap[title] == null) {
                    hashMap[title] = 0;
                }
                else {
                    hashMap[title] += 1;
                }
                let hash = this.getHash(title, this.configManager.options.ANCHOR_MODE.value, hashMap[title]);
                let headerRange = new Range(index, 0, index, lineText.length);
                headerList.push(new Header(index, depth, title, hash, headerRange, headerResult[1], orderedListStr, baseTitle));
            }
            return headerList;
        }
        return headerList;
    }

    private getNextLineIndexIsNotInCode(index: number, lineText: string, doc: TextDocument) {
        let isCodeStyle1 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK1) != null;
        let isCodeStyle2 = lineText.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK2) != null;

        let nextIndex = index;

        while (isCodeStyle1 || isCodeStyle2) {
            let nextLine = doc.lineAt(nextIndex).text;

            isCodeStyle1 = nextLine.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK1) != null;
            isCodeStyle2 = nextLine.match(this.configManager.optionKeys.REGEXP_CODE_BLOCK2) != null;

            nextIndex = index + 1;
        }

        return nextIndex;
    }

    private getHeaderMeta(lineText: string) {
        let headerMeta = new HeaderMeta();

        let headerTextSplit = lineText.match(this.configManager.optionKeys.REGEXP_HEADER_META);

        if (headerTextSplit != null) {
            headerMeta.headerMark = headerTextSplit[1];
            headerMeta.orderedListString = headerTextSplit[2];
            headerMeta.baseTitle = headerTextSplit[4];
        }

        return headerMeta;
    }

    private cleanUpTitle(dirtyTitle: string) {
        let title = dirtyTitle.replace(/\[(.+)]\([^)]*\)/gi, "$1"); // replace link
        title = title.replace(/<!--.+-->/gi, ""); // replace comment
        title = title.replace(/\#*_/gi, "").trim(); // replace special char
        return title;
    }

    private getHash(headername: string, mode: string, repetition: number) {
        let anchor = require('anchor-markdown-header');
        return decodeURI(anchor(headername, mode, repetition));
    }

    dispose() {
    }
}
