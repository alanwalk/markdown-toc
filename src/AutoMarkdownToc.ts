import {
    window,
    Position,
    Range,
    TextEditorEdit
} from 'vscode';
import { Header } from "./models/Header";
import { ConfigManager } from './ConfigManager';
import { HeaderManager } from './HeaderManager';
import { AnchorMode } from './models/AnchorMode';

export class AutoMarkdownToc {

    configManager = new ConfigManager();
    headerManager = new HeaderManager();

    // Public function
    public updateMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

        if (editor == undefined) {
            return;
        }

        autoMarkdownToc.configManager.updateOptions();
        let tocRange = autoMarkdownToc.getTocRange();
        let headerList = autoMarkdownToc.headerManager.getHeaderList();

        editor.edit(function (editBuilder) {
            if (!tocRange.isSingleLine) {
                editBuilder.delete(tocRange);
                autoMarkdownToc.deleteAnchors(editBuilder);
            }

            autoMarkdownToc.createToc(editBuilder, headerList, tocRange.start);
            autoMarkdownToc.insertAnchors(editBuilder, headerList);
        });
    }

    public deleteMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

        if (editor == undefined) {
            return;
        }

        editor.edit(function (editBuilder) {
            let tocRange = autoMarkdownToc.getTocRange();
            if (tocRange.isSingleLine) {
                return;
            }

            editBuilder.delete(tocRange);
            autoMarkdownToc.deleteAnchors(editBuilder);
        });
    }

    public updateMarkdownSections() {
        this.configManager.updateOptions();

        let headerList = this.headerManager.getHeaderList();
        let editor = window.activeTextEditor;
        let config = this.configManager;

        if (editor != undefined) {
            config.options.isOrderedListDetected = true;
            let document = editor.document;
            editor.edit(function (editBuilder) {
                headerList.forEach(header => {

                    if (header.range.start.line != 0 && !document.lineAt(header.range.start.line - 1).isEmptyOrWhitespace) {
                        editBuilder.insert(new Position(header.range.start.line, 0), config.lineEnding);
                    }

                    editBuilder.replace(header.range, header.fullHeaderWithOrder);
                });
            });
        }
    }

    public deleteMarkdownSections() {
        this.configManager.updateOptions();
        let headerList = this.headerManager.getHeaderList();
        let editor = window.activeTextEditor;
        let config = this.configManager;

        if (editor != undefined && headerList != undefined) {
            config.options.isOrderedListDetected = false;
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    editBuilder.replace(element.range, element.fullHeaderWithoutOrder);
                });
            });
        }
    }

    // public notifyDocumentSave() {
    //     // Prevent save again
    //     if (this.configManager.options.isProgrammaticallySave) {
    //         this.configManager.options.isProgrammaticallySave = false;
    //         return;
    //     }

    //     let editor = window.activeTextEditor;
    //     if (editor != undefined) {
    //         let doc = editor.document;
    //         if (doc.languageId != 'markdown') {
    //             return;
    //         }

    //         if (this.updateMarkdownToc(true)) {
    //             doc.save();
    //             this.configManager.options.isProgrammaticallySave = true;
    //         }
    //     }
    // }

    /**
     * Get TOC range, in case of no TOC, return the active line
     * In case of the editor is not available, return the first line
     */
    private getTocRange() {
        let editor = window.activeTextEditor;

        if (editor == undefined) {
            return new Range(0, 0, 0, 0);
        }

        let doc = editor.document;
        let start, end: Position | undefined;

        for (let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;

            if ((start == undefined) && (lineText.match(this.configManager.regexStrings.REGEXP_TOC_START))) {
                start = new Position(index, 0);
            }
            else if (lineText.match(this.configManager.regexStrings.REGEXP_TOC_STOP)) {
                end = new Position(index, lineText.length);
                break;
            }
        }

        if ((start == undefined) || (end == undefined)) {
            if (start != undefined) {
                end = start;
            } else if (end != undefined) {
                start = end;
            } else {
                start = editor.selection.active;
                end = editor.selection.active;
            }
        }

        return new Range(start, end);
    }

    /**
     * insert anchor for a header
     * @param editBuilder 
     * @param header 
     */
    private insertAnchor(editBuilder: TextEditorEdit, header: Header) {
        let anchorMatches = header.hash.match(this.configManager.regexStrings.REGEXP_ANCHOR);
        if (anchorMatches != null) {
            let name = anchorMatches[1];
            let text = [
                this.configManager.lineEnding,
                '<a id="markdown-',
                name,
                '" name="',
                name,
                '"></a>'];

            let insertPosition = new Position(header.range.end.line, header.range.end.character);

            if (this.configManager.options.ANCHOR_MODE.value == AnchorMode.bitbucket) {
                text = text.slice(1);
                text.push(this.configManager.lineEnding);
                text.push(this.configManager.lineEnding);
                insertPosition = new Position(header.range.start.line, 0);
            }

            editBuilder.insert(insertPosition, text.join(''));
        }
    }

    private insertAnchors(editBuilder: TextEditorEdit, headerList: Header[]) {
        if (!this.configManager.options.INSERT_ANCHOR.value) {
            return;
        }

        headerList.forEach(header => {
            this.insertAnchor(editBuilder, header);
        });
    }

    private deleteAnchors(editBuilder: TextEditorEdit) {
        let editor = window.activeTextEditor;
        if (editor != undefined) {
            let doc = editor.document;
            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;
                if (lineText.match(this.configManager.regexStrings.REGEXP_MARKDOWN_ANCHOR) == null) {
                    continue;
                }

                // To ensure the anchor will not insert an extra empty line
                let startPosition = new Position(index, 0);
                if (index > 0 && doc.lineAt(index).text == this.configManager.lineEnding) {
                    startPosition = new Position(index - 1, 0);
                }

                let range = new Range(startPosition, new Position(index + 1, 0));
                editBuilder.delete(range);
            }
        }
    }

    private createToc(editBuilder: TextEditorEdit, headerList: Header[], insertPosition: Position) {

        let text: string[] = [];

        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());

        //// HEADERS
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });

        let tocRows: string[] = [];

        headerList.forEach(header => {
            if (header.depth >= this.configManager.options.DEPTH_FROM.value) {
                let row = this.generateTocRow(header, minimumRenderedDepth);
                tocRows.push(row);
            }
        });

        text.push(tocRows.join(this.configManager.lineEnding));

        //// TOC END
        text.push(this.configManager.lineEnding + "<!-- /TOC -->");

        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.lineEnding));
    }

    private generateTocRow(header: Header, minimumRenderedDepth: number) {
        let row: string[] = [];

        // Indentation
        let indentRepeatTime = header.depth - Math.max(this.configManager.options.DEPTH_FROM.value, minimumRenderedDepth);
        row.push(this.configManager.tab.repeat(indentRepeatTime));

        // TOC with or without ordered numbers?
        if (this.configManager.options.ORDERED_LIST.value) {
            row.push(header.orderArray[header.orderArray.length - 1].toString() + ".");
        } else {
            row.push(this.configManager.options.BULLET_CHAR.value);
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

        this.generateCustomOptionsInTocStart(tocStartIndicator);

        tocStartIndicator.push('-->' + this.configManager.lineEnding);

        return tocStartIndicator.join('');
    }

    private generateCustomOptionsInTocStart(tocStartIndicator: string[]) {
        // custom options
        this.configManager.options.optionsFlag.forEach(optionKey => {
            if (this.configManager.options.optionsFlag.indexOf(optionKey) != -1) {
                tocStartIndicator.push(optionKey + ':' + this.configManager.options.getOptionValueByKey(optionKey) + ' ');
            }
        });
    }

    dispose() {
    }
}