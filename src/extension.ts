// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {
    window, 
    commands, 
    Disposable, 
    ExtensionContext, 
    StatusBarAlignment, 
    StatusBarItem, 
    TextDocument,
    workspace,
    Position,
    Range,
    TextEditor,
    TextEditorEdit
} from 'vscode';
    
const REGEXP_TOC_START          = /\s*<!--(.*)TOC(.*)-->/gi;
const REGEXP_TOC_STOP           = /\s*<!--(.*)\/TOC(.*)-->/gi;
const REGEXP_TOC_CONFIG         = /\w+(:|=)(\d+|true|false)\b/gi;
const REGEXP_TOC_CONFIG_KEY     = /\w+/;
const REGEXP_TOC_CONFIG_VALUE   = /(\d+|true|false)\b/gi;
const REGEXP_MARKDOWN_ANCHOR    = /^<a id="markdown-.+" name=".+"><\/a\>/;
const REGEXP_HEADER             = /^\#{1,6}/;
const REGEXP_CODE_BLOCK         = /^```/

const DEPTH_FROM                = "depthFrom";
const DEPTH_TO                  = "depthTo";
const INSERT_ANCHOR             = "insertAnchor";
const WITH_LINKS                = "withLinks";
const ORDERED_LIST              = "orderedList";
const UPDATE_ON_SAVE            = "updateOnSave";

const LOWER_DEPTH_FROM          = DEPTH_FROM.toLocaleLowerCase();
const LOWER_DEPTH_TO            = DEPTH_TO.toLocaleLowerCase();
const LOWER_INSERT_ANCHOR       = INSERT_ANCHOR.toLocaleLowerCase();
const LOWER_WITH_LINKS          = WITH_LINKS.toLocaleLowerCase();
const LOWER_ORDERED_LIST        = ORDERED_LIST.toLocaleLowerCase();
const LOWER_UPDATE_ON_SAVE      = UPDATE_ON_SAVE.toLocaleLowerCase();

export function activate(context: ExtensionContext) {

    // create a MarkdownTocTools
    let markdownTocTools = new MarkdownTocTools();
    
    let disposable_createMarkdownToc = commands.registerCommand('extension.createMarkdownToc', () => { markdownTocTools.create(); });
    let disposable_updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', () => { markdownTocTools.update(); });
    let disposable_deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => { markdownTocTools.delete(); });
    
    // register document save event
    let disposable_saveMarkdownToc = workspace.onDidSaveTextDocument((doc : TextDocument) => { markdownTocTools.notifyDocumentSave(); });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(disposable_createMarkdownToc);
    context.subscriptions.push(disposable_updateMarkdownToc);
    context.subscriptions.push(disposable_deleteMarkdownToc);
    context.subscriptions.push(disposable_saveMarkdownToc);
}

class MarkdownTocTools {
    
    options = {
        DEPTH_FROM       : 1,
        DEPTH_TO         : 6,
        INSERT_ANCHOR    : false,
        WITH_LINKS       : true,
        ORDERED_LIST     : false,
        UPDATE_ON_SAVE   : true
    };
    optionsFlag = [];
    saveBySelf = false;
    
    // Public function
    public create() {
        this.update();        
    }
    
    public update(isBySave : boolean = false) {
        let editor = window.activeTextEditor;
        let markdownTocTools = this;
        
        window.activeTextEditor.edit(function(editBuilder) {
            let tocRange = markdownTocTools.getTocRange();
            let insertPosition = editor.selection.active;
            
            markdownTocTools.updateOptions(tocRange);
            if (isBySave && ((!markdownTocTools.options.UPDATE_ON_SAVE) || (tocRange == null))) return false;
            
            // save options, and delete last insert
            if (tocRange != null) {
                insertPosition = tocRange.start;
                editBuilder.delete(tocRange);
                markdownTocTools.deleteAnchor(editBuilder);
            }
            let headerList = markdownTocTools.getHeaderList(tocRange);
            
            markdownTocTools.createToc(editBuilder, headerList, insertPosition);
            markdownTocTools.insertAnchor(editBuilder, headerList);
        });
        return true;
    }
    
    public delete() {
        let markdownTocTools = this;
        
        window.activeTextEditor.edit(function(editBuilder) {
            let tocRange = markdownTocTools.getTocRange();
            if (tocRange == null) return;
            
            editBuilder.delete(tocRange);
            markdownTocTools.deleteAnchor(editBuilder);
        });
    }
    
    public notifyDocumentSave() {
        // Prevent save again
        if (this.saveBySelf) {
            this.saveBySelf = false;
            return;
        }
        let doc = window.activeTextEditor.document;
        if (doc.languageId != 'markdown') return;
        if (this.update(true)) {
            doc.save();
            this.saveBySelf = true;
        }
    }
    
    // Private function    
    private getTocRange() {
        let doc = window.activeTextEditor.document;
        let start, stop : Position;
        
        for(let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;
            if ((start == null) && (lineText.match(REGEXP_TOC_START))) {
                start = new Position(index, 0);
            } else if (lineText.match(REGEXP_TOC_STOP)) {
                stop = new Position(index, lineText.length);
                break;
            }
        }
        if ((start != null) && (stop != null)) {
            return new Range(start, stop);
        }
        return null;
    }
    
    private updateOptions(tocRange : Range) {
        this.options.DEPTH_FROM     = <number>  workspace.getConfiguration('markdown-toc').get('depthFrom');
        this.options.DEPTH_TO       = <number>  workspace.getConfiguration('markdown-toc').get('depthTo');
        this.options.INSERT_ANCHOR  = <boolean> workspace.getConfiguration('markdown-toc').get('insertAnchor');
        this.options.WITH_LINKS     = <boolean> workspace.getConfiguration('markdown-toc').get('withLinks');
        this.options.ORDERED_LIST   = <boolean> workspace.getConfiguration('markdown-toc').get('orderedList');
        this.options.UPDATE_ON_SAVE = <boolean> workspace.getConfiguration('markdown-toc').get('updateOnSave');

        if (tocRange == null) return;
        let optionsText = window.activeTextEditor.document.lineAt(tocRange.start.line).text;
        let optionArray = optionsText.match(REGEXP_TOC_CONFIG);
        
        this.optionsFlag = [];
        optionArray.forEach(element => {
            let key = element.match(REGEXP_TOC_CONFIG_KEY)[0].toLocaleLowerCase();
            let value = element.match(REGEXP_TOC_CONFIG_VALUE)[0];
            
            switch (key) {
                case LOWER_DEPTH_FROM:
                    this.optionsFlag.push(DEPTH_FROM);
                    this.options.DEPTH_FROM = this.parseValidNumber(value);
                    break;
                case LOWER_DEPTH_TO:
                    this.optionsFlag.push(DEPTH_TO);
                    this.options.DEPTH_TO = this.parseValidNumber(value);
                    if (this.options.DEPTH_FROM > this.options.DEPTH_TO) {
                        this.options.DEPTH_TO = this.options.DEPTH_FROM; // Revise Value
                    }
                    break;
                case LOWER_INSERT_ANCHOR:
                    this.optionsFlag.push(INSERT_ANCHOR);
                    this.options.INSERT_ANCHOR = this.parseBool(value);
                    break;
                case LOWER_WITH_LINKS:
                    this.optionsFlag.push(WITH_LINKS);
                    this.options.WITH_LINKS = this.parseBool(value);
                    break;
                case LOWER_ORDERED_LIST:
                    this.optionsFlag.push(ORDERED_LIST);
                    this.options.ORDERED_LIST = this.parseBool(value);
                    break;
                case LOWER_UPDATE_ON_SAVE:
                    this.optionsFlag.push(UPDATE_ON_SAVE);
                    this.options.UPDATE_ON_SAVE = this.parseBool(value);
                    break;
            }
        });
    }
    
    private insertAnchor(editBuilder : TextEditorEdit, headerList : any[])
    {
        if (!this.options.INSERT_ANCHOR) return;
        headerList.forEach(element => {
            let text = [ '<a id="markdown-', element.hash, '" name="', element.hash, '"></a>\n' ];
            let insertPosition = new Position(element.line, 0);
            editBuilder.insert(insertPosition, text.join(''));
        });
    }
    
    private deleteAnchor(editBuilder : TextEditorEdit) {
        let doc = window.activeTextEditor.document;
        for(let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;
            if(lineText.match(REGEXP_MARKDOWN_ANCHOR) == null) continue;
            
            let range = new Range(new Position(index, 0), new Position(index + 1, 0));
            editBuilder.delete(range);
        }
    }
    
    private createToc(editBuilder : TextEditorEdit, headerList : any[], insertPosition : Position) {
        let optionsText = [];
        optionsText.push('<!-- TOC ');
        if (this.optionsFlag.indexOf(DEPTH_FROM)    != -1) optionsText.push(DEPTH_FROM	    + ':' + this.options.DEPTH_FROM     +' ');
        if (this.optionsFlag.indexOf(DEPTH_TO)      != -1) optionsText.push(DEPTH_TO        + ':' + this.options.DEPTH_TO	    +' ');
        if (this.optionsFlag.indexOf(INSERT_ANCHOR) != -1) optionsText.push(INSERT_ANCHOR   + ':' + this.options.INSERT_ANCHOR  +' ');
        if (this.optionsFlag.indexOf(ORDERED_LIST)  != -1) optionsText.push(ORDERED_LIST    + ':' + this.options.ORDERED_LIST   +' ');
        if (this.optionsFlag.indexOf(UPDATE_ON_SAVE)!= -1) optionsText.push(UPDATE_ON_SAVE  + ':' + this.options.UPDATE_ON_SAVE +' ');
        if (this.optionsFlag.indexOf(WITH_LINKS)    != -1) optionsText.push(WITH_LINKS      + ':' + this.options.WITH_LINKS     +' ');
        optionsText.push('-->\n');

        let text = [];
        text.push(optionsText.join(''));
        
        let indicesOfDepth = Array.apply(null, new Array(this.options.DEPTH_TO - this.options.DEPTH_FROM + 1)).map(Number.prototype.valueOf, 0);
        headerList.forEach(element => {
            if (element.depth <= this.options.DEPTH_TO) {
                let length = element.depth - this.options.DEPTH_FROM;
                let row = [
                    '\t'.repeat(length),
                    this.options.ORDERED_LIST ? (++indicesOfDepth[length] + '. ') : '- ',
                    this.options.WITH_LINKS ? ('[' + element.title + '](#' + element.hash + ')') : element.title
                ];
                text.push(row.join(''));
            }
        });
        
        text.push("\n<!-- /TOC -->");
        editBuilder.insert(insertPosition, text.join('\n'));
    }
    
    private getHeaderList(tocRange : Range) {
        let doc = window.activeTextEditor.document;
        let headerList = [];
        let isInCode = false;
        for (let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;
            let codeResult = lineText.match(REGEXP_CODE_BLOCK);
            if (codeResult != null) isInCode = !isInCode;
            if (isInCode) continue;
            
            let headerResult = lineText.match(REGEXP_HEADER);
            if (headerResult == null) continue;
            
            let depth = headerResult[0].length;
            if (depth < this.options.DEPTH_FROM) continue;
            
            let title = lineText.substr(depth).trim();
            let hash = this.getHash(title);
            headerList.push({
                line : index,
                depth : depth,
                title : title,
                hash : hash
            });
        }
        return headerList;
    }
    
    private getHash(headername : string) {
        let hash = headername.toLocaleLowerCase();
        hash = hash.replace(/\s+/g, '-');
        hash = hash.replace(/[^a-z0-9\u4e00-\u9fa5äüö\-]/g, '');
        if (hash.indexOf("--") > -1) {
            hash = hash.replace(/(-)+/g, "-");
        }
        if (hash.indexOf(":-") > -1) {
            hash = hash.replace(/:-/g, "-");
        }
        return hash;
    }
    
    private parseValidNumber(input : string) {
        let num = parseInt(input);
        if (num < 1) {
            return 1;
        }
        if (num > 6) {
            return 6;
        }
        return num;
    }
    
    private parseBool(input : string) {
        return input.toLocaleLowerCase() == 'true';
    }

    dispose() {
    }
}