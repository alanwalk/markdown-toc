import {
    window,
    Position,
    Range,
    TextEditorEdit
} from 'vscode';
import { Header } from "./models/Header";
import { ConfigManager } from './ConfigManager';
import { HeaderManager } from './HeaderManager';

export class AutoMarkdownToc {

    configManager = new ConfigManager();
    headerManager = new HeaderManager();

    // Public function
    public updateMarkdownToc(isBySave: boolean = false) {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

        if (editor == undefined) {
            return false;
        }

        let insertPosition = editor.selection.active;

        editor.edit(function (editBuilder) {
            let tocRange = autoMarkdownToc.getTocRange();
            autoMarkdownToc.updateOptions(tocRange);
            if (isBySave && ((!autoMarkdownToc.configManager.options.UPDATE_ON_SAVE.value) || (tocRange == null))) {
                return false
            };

            // save options, and delete last insert
            if (tocRange != null) {
                insertPosition = tocRange.start;
                editBuilder.delete(tocRange);
                autoMarkdownToc.deleteAnchor(editBuilder);
            }

            let headerList = autoMarkdownToc.headerManager.getHeaderList();

            autoMarkdownToc.createToc(editBuilder, headerList, insertPosition);
            autoMarkdownToc.insertAnchor(editBuilder, headerList);
        });

        return true;
    }

    public deleteMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;
        if (editor == undefined) {
            return false;
        }
        editor.edit(function (editBuilder) {
            let tocRange = autoMarkdownToc.getTocRange();
            if (tocRange == null)
                return;
            editBuilder.delete(tocRange);
            autoMarkdownToc.deleteAnchor(editBuilder);
        });
    }

    public updateMarkdownSections() {
        let tocRange = this.getTocRange();
        this.updateOptions(tocRange);
        let headerList = this.headerManager.getHeaderList();
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
        let headerList = this.headerManager.getHeaderList();
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

        //// HEADERS - NEW
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth)
        });

        let tocRows: string[] = [];

        headerList.forEach(header => {
            if (header.depth >= this.configManager.options.DEPTH_FROM.value) {
                let row = this.generateTocRow(header, minimumRenderedDepth);
                tocRows.push(row);
            }
        });



        // //// HEADERS
        // let indicesOfDepth = this.getIndiceOfDepth();
        // let waitResetList = Array.apply(null, new Array(indicesOfDepth.length)).map(Boolean.prototype.valueOf, false);
        // let minDepth = 6;

        // headerList.forEach(element => {
        //     minDepth = Math.min(element.depth, minDepth);
        // });

        // let startDepth = Math.max(minDepth, this.configManager.options.DEPTH_FROM.value);

        // headerList.forEach(element => {
        //     if (element.depth <= this.configManager.options.DEPTH_TO.value) {
        //         let length = element.depth - startDepth;
        //         for (var index = 0; index < waitResetList.length; index++) {
        //             if (waitResetList[index] && (length < index)) {
        //                 indicesOfDepth[index] = 0;
        //                 waitResetList[index] = false;
        //             }
        //         }

        //         let row = [
        //             this.configManager.tab.repeat(length),
        //             this.configManager.options.ORDERED_LIST.value ? (++indicesOfDepth[length] + '. ') : '- ',
        //             this.configManager.options.WITH_LINKS.value ? element.hash : element.dirtyHeaderWithoutHeaderMark
        //         ];

        //         text.push(row.join(''));
        //         waitResetList[length] = true;
        //     }
        // });

        //// TOC END
        text.push(this.configManager.lineEnding + "<!-- /TOC -->");

        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.lineEnding));
    }

    private generateTocRow(header: Header, minimumRenderedDepth: number) {
        let row: string[] = [];

        // Indentation
        // TODO: Bug here
        // let indentRepeatTime = header.depth - Math.max(this.configManager.options.DEPTH_FROM.value, minimumRenderedDepth);
        let indentRepeatTime = header.depth - this.configManager.options.DEPTH_FROM.value;
        row.push(this.configManager.tab.repeat(indentRepeatTime));

        // TOC with or without ordered numbers?
        if (this.configManager.options.ORDERED_LIST.value) {
            row.push(header.orderArray[header.orderArray.length - 1].toString() + ".");
        } else {
            row.push('-');
        }

        row.push(' ');

        // TOC with or without link
        if (this.configManager.options.WITH_LINKS.value) {
            row.push(header.hash);
        } else {
            row.push(header.dirtyHeaderWithoutHeaderMark);
        }

        return row.join('');
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

    dispose() {
    }
}