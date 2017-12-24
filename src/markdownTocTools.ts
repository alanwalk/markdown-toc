'use strict';

import * as vscode from 'vscode';
import * as utils from './utils';
import { MarkdownConfigs } from './markdownConfig';
import { MarkdownHeaderProvider, MarkdownHeaderNode } from './markdownHeaderProvider'

const REGEXP_TOC_START_OLD      = /\s*<!--(.*)TOC(.*)-->/gi;
const REGEXP_TOC_STOP_OLD       = /\s*<!--(.*)\/TOC(.*)-->/gi;
const REGEXP_TOC_START          = /\s*\[comment\]: \# \((.*)TOC(.*)\)/gi;
const REGEXP_TOC_STOP           = /\s*\[comment\]: \# \((.*)\/TOC(.*)\)/gi;

const REGEXP_MARKDOWN_ANCHOR    = /^<a id="markdown-.+" name=".+"><\/a\>/;
const REGEXP_HEADER             = /^(\#{1,6})\s*([.0-9]*)\s*(.+)/;
const REGEXP_CODE_BLOCK1        = /^```/;
const REGEXP_CODE_BLOCK2        = /^~~~/;
const REGEXP_ANCHOR             = /\[.+\]\(#(.+)\)/
const REGEXP_IGNORE_TITLE       = /<!-- TOC ignore:true -->/

export class MarkdownTocTools {

    private markdownConfigs : MarkdownConfigs;
    private markdownHeaderProvider : MarkdownHeaderProvider;

    constructor() {
        this.markdownConfigs = new MarkdownConfigs();
        this.markdownHeaderProvider = new MarkdownHeaderProvider();

        vscode.window.registerTreeDataProvider('MarkdownToc', this.markdownHeaderProvider);
        vscode.workspace.onWillSaveTextDocument((event) => this.onWillSaveTextDocument(event));
    }

    updateToc() {
        vscode.window.activeTextEditor.edit(editBuilder => {
            const tocRange = this.getTocRange();
            if (tocRange != null) {
                this.updateConfigs(tocRange);
                this.deleteAnchor(editBuilder);
                editBuilder.delete(tocRange);
            }
            let headerRootNode = this.getHeaderRootNode();
            this.markdownHeaderProvider.setRootNode(headerRootNode);

            this.createToc(editBuilder, headerList, tocRange.start);
            this.insertAnchor(editBuilder, headerList);
            utils.revealLine(tocRange.start.line)
        });
    }

    deleteToc() {
        vscode.window.activeTextEditor.edit(editBuilder => {
            let tocRange = this.getTocRange();
            if (tocRange) {
                editBuilder.delete(tocRange);
                this.deleteAnchor(editBuilder);
            }
        });
    }

    updateSections() {
        vscode.window.activeTextEditor.edit(editBuilder => {
            const tocRange = this.getTocRange();
            this.updateConfigs(tocRange);
            let headerList = this.getHeaderList();
            headerList.forEach(element => {
                let newHeader = element.header + " " + element.orderedList + " " + element.baseTitle
                editBuilder.replace(element.range, newHeader);
            });
        });
    }

    deleteSections() {
        vscode.window.activeTextEditor.edit(editBuilder => {
            let tocRange = this.getTocRange();
            this.updateConfigs(tocRange);
            let headerList = this.getHeaderList();
            headerList.forEach(element => {
                let newHeader = element.header + " " + element.baseTitle
                editBuilder.replace(element.range, newHeader);
            });
        });
    }

    private onWillSaveTextDocument(event : vscode.TextDocumentWillSaveEvent) {
        if (utils.isMarkdown(event.document)                            // Markdown file
        && (event.document === vscode.window.activeTextEditor.document) // Current file
        && (event.reason === vscode.TextDocumentSaveReason.Manual)      // User manual save 
        && this.markdownConfigs.updateOnSave) {                         // Config is true
            this.updateToc()
        }
    }

    private getTocRange(): vscode.Range {
        let start, stop: vscode.Position;
        const document = vscode.window.activeTextEditor.document;
        
        // match new regexp
        for (let index = 0; index < document.lineCount; index++) {
            const lineText = document.lineAt(index).text;
            if ((start === null) && (lineText.match(REGEXP_TOC_START))) {
                start = new vscode.Position(index, 0);
            } else if ((start != null) && lineText.match(REGEXP_TOC_STOP)) {
                stop = new vscode.Position(index, lineText.length);
                return new vscode.Range(start, stop);
            }
        }

        // match old regexp
        for (let index = 0; index < document.lineCount; index++) {
            const lineText = document.lineAt(index).text;
            if ((start === null) && (lineText.match(REGEXP_TOC_START_OLD))) {
                start = new vscode.Position(index, 0);
            } else if ((start != null) && lineText.match(REGEXP_TOC_STOP_OLD)) {
                stop = new vscode.Position(index, lineText.length);
                return new vscode.Range(start, stop);
            }
        }
        return null;
    }

    private updateConfigs(range: vscode.Range) {
        const lineIndex = range.start.line
        const document = vscode.window.activeTextEditor.document;
        this.markdownConfigs.setConfig(document.lineAt(lineIndex).text);
    }

    private insertAnchor(editBuilder: vscode.TextEditorEdit, headerList: any[]) {
        if (this.markdownConfigs.insertAnchor) {
            headerList.forEach(element => {
                let name = element.hash.match(REGEXP_ANCHOR)[1];
                let text = ['<a id="markdown-', name, '" name="', name, '"></a>\n'];
                let insertPosition = new vscode.Position(element.line, 0);
                editBuilder.insert(insertPosition, text.join(''));
            });
        }
    }

    private deleteAnchor(editBuilder: vscode.TextEditorEdit) {
        let document = vscode.window.activeTextEditor.document;
        for (let index = 0; index < document.lineCount; index++) {
            let lineText = document.lineAt(index).text;
            if (lineText.match(REGEXP_MARKDOWN_ANCHOR)) {
                editBuilder.delete(new vscode.Range(index, 0, index + 1, 0));
            }
        }
    }

    private createToc(editBuilder: vscode.TextEditorEdit, headerRootNode: MarkdownHeaderNode, insertPosition: vscode.Position) {
        const editor = vscode.window.activeTextEditor
        const eol = (editor.document.eol === vscode.EndOfLine.LF) ? '\n' : '\r\n';
        const tab = editor.options.insertSpaces ? ' '.repeat(<number>editor.options.tabSize) : '\t'
        let text = [];
        text.push(eol);
        text.push('[comment]: # (TOC ' + this.markdownConfigs.getConfigString() + ')');
        text.push(eol);
        let startDepth = Math.max(headerRootNode.depth, this.markdownConfigs.depthFrom);
        text.concat(this.getHeaderString(headerRootNode, startDepth, tab))
        text.push('[comment]: # (/TOC)');
        editBuilder.insert(insertPosition, text.join(eol));
    }

    private getHeaderString(node: MarkdownHeaderNode, startDepth: number, tab: string, index: number = 0): string[] {
        let ret: string[] = []
        const row = [
            tab.repeat(node.depth - startDepth),
            this.markdownConfigs.orderedList ? ((index + 1) + '. ') : '- ',
            this.markdownConfigs.withLinks ? node.titleWithLink : node.title
        ];
        ret.push(row.join(''))
        for (let index = 0; index < node.childNodes.length; index++) {
            ret.concat(this.getHeaderString(node.childNodes[index], startDepth, tab, index))
        }
        return ret;
    }

    private getHeaderList() {
        let document = vscode.window.activeTextEditor.document;
        let headerList = [];
        let hashMap = {};
        let isInCode = 0;
        let indicesOfDepth = Array.apply(null, new Array(6)).map(Number.prototype.valueOf, 0);
        for (let index = 0; index < document.lineCount; index++) {
            let lineText = document.lineAt(index).text;
            let codeResult1 = lineText.match(REGEXP_CODE_BLOCK1);
            let codeResult2 = lineText.match(REGEXP_CODE_BLOCK2);
            if (isInCode === 0) {
                isInCode = codeResult1 != null ? 1 : (codeResult2 != null ? 2 : isInCode);
            } else if (isInCode === 1) {
                isInCode = codeResult1 != null ? 0 : isInCode;
            } else if (isInCode === 2) {
                isInCode = codeResult2 != null ? 0 : isInCode;
            }
            if (isInCode) continue;

            let headerResult = lineText.match(REGEXP_HEADER);
            if (headerResult === null) continue;

            let depth = headerResult[1].length;
            if (depth < this.markdownConfigs.depthFrom) continue;
            if (depth > this.markdownConfigs.depthTo) continue;

            if (lineText.match(REGEXP_IGNORE_TITLE)) continue;

            for (var i = depth; i <= this.markdownConfigs.depthTo; i++) {
                indicesOfDepth[depth] = 0;
            }
            indicesOfDepth[depth - 1]++;

            let orderedListStr = ""
            for (var i = this.markdownConfigs.depthFrom - 1; i < depth; i++) {
                orderedListStr += indicesOfDepth[i].toString() + ".";
            }

            let title = lineText.substr(depth).trim();
            title = title.replace(/\[(.+)]\([^)]*\)/gi, "$1");  // replace link
            title = title.replace(/<!--.+-->/gi, "");           // replace comment
            title = title.replace(/\#*_/gi, "").trim();         // replace special char

            if (hashMap[title] === null) {
                hashMap[title] = 0
            } else {
                hashMap[title] += 1;
            }

            let hash = this.getHash(title, this.markdownConfigs.anchorMode, hashMap[title]);
            headerList.push({
                line: index,
                depth: depth,
                title: title,
                hash: hash,
                range: new vscode.Range(index, 0, index, lineText.length),
                header: headerResult[1],
                orderedList: orderedListStr,
                baseTitle: headerResult[3]
            });
        }
        return headerList;
    }

    private getHash(headername: string, mode: string, repetition: number): string {
        let anchor = require('anchor-markdown-header');
        return decodeURI(anchor(headername, mode, repetition));
    }
}
