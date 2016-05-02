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
    TextEditor
} from 'vscode';
    
const REGEXP_TOC_START = /\s*<!--(.*)TOC(.*)-->/gi;
const REGEXP_TOC_STOP = /\s*<!--(.*)\/TOC(.*)-->/gi;
const REGEXP_TOC_CONFIG = /\w+(:|=)(\d+|true|false)\b/gi;
const REGEXP_TOC_CONFIG_KEY = /\w+/;
const REGEXP_TOC_CONFIG_VALUE = /(\d+|true|false)\b/gi;

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    // create a MarkdownTocTools
    let markdownTocTools = new MarkdownTocTools();
    
    let disposable_createMarkdownToc = commands.registerCommand('extension.createMarkdownToc', () => {
        markdownTocTools.create();
    });
    let disposable_updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', () => {
        markdownTocTools.update();
    });
    let disposable_deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => {
        markdownTocTools.delete();
    });
    
    // register document save event
    let disposable_saveMarkdownToc = workspace.onDidSaveTextDocument((doc : TextDocument) => {
        markdownTocTools.notifyDocumentSave();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(disposable_createMarkdownToc);
    context.subscriptions.push(disposable_updateMarkdownToc);
    context.subscriptions.push(disposable_deleteMarkdownToc);
    context.subscriptions.push(disposable_saveMarkdownToc);
}

class MarkdownTocTools {
    
    options = {
        "depthFrom"     : 1,
        "depthTo"       : 6,
        'withLinks'     : true,
        "orderedList"   : false,
        "updateOnSave"  : true
    };
    
    saveBySelf = false;
    
    // Public function
    public create() {
        let tocRange = this.getTocRange();
        if (tocRange != null) {
            this.updateOptions(tocRange);
            this.updateToc(tocRange);
        } else {
            this.createToc();
        }
    }
    
    public update() {
        this.create();
    }
    
    public delete() {
        let tocRange = this.getTocRange();
        if (tocRange != null) {
            this.deleteToc(tocRange);
        }
    }
    
    public notifyDocumentSave() {
        // Prevent save again
        if (this.saveBySelf) {
            this.saveBySelf = false;
            return;
        }
        let tocRange = this.getTocRange();
        if (tocRange != null) {
            this.updateOptions(tocRange);
            if (!this.options.updateOnSave) {
                return;
            }
            this.updateToc(tocRange);
            window.activeTextEditor.document.save();
            this.saveBySelf = true;
        }
    }
    
    // Private function    
    private getTocRange() {
        let doc = window.activeTextEditor.document;
        let start : Position;
        let stop : Position;
        
        for(let index = 0; index < doc.lineCount; index++) {
            let lineText = doc.lineAt(index).text;
            if ((start == null) && (lineText.match(REGEXP_TOC_START))) {
                start = new Position(index, 0);
            } else if (lineText.match(REGEXP_TOC_STOP)) {
                stop = new Position(index, lineText.length); 
            }
        }
        if ((start != null) && (stop != null)) {
            return new Range(start, stop);
        }
        return null;
    }
    
    private updateOptions(tocRange : Range) {
        if (tocRange == null) return;
        
        let doc = window.activeTextEditor.document;
        let configText = doc.lineAt(tocRange.start.line).text;

        let matchResult = configText.match(REGEXP_TOC_CONFIG);
        for (let index = 0; index < matchResult.length; index++) {
            let element = matchResult[index];
            let key = element.match(REGEXP_TOC_CONFIG_KEY)[0].toLocaleLowerCase();
            let value = element.match(REGEXP_TOC_CONFIG_VALUE)[0];
            
            if (key == "depthfrom") {
                this.options.depthFrom = this.parseValidBool(value);
            } else if (key == "depthto") {
                this.options.depthTo = this.parseValidBool(value);
                if (this.options.depthFrom > this.options.depthTo) {
                    this.options.depthTo = this.options.depthFrom;
                }
            } else if (key == "withlinks") {
                this.options.withLinks = this.parseBool(value);
            } else if (key == "orderedlist") {
                this.options.orderedList = this.parseBool(value);
            } else if (key == "updateonsave") {
                this.options.updateOnSave = this.parseBool(value);
            }
        }
    }

    private createToc() {
        let editor = window.activeTextEditor;
        let text = this.createTocString(null);
        
        editor.edit(function(edit) {
            edit.insert(editor.selection.active, text);
        });
    }
    
    private updateToc(tocRange : Range) {
        if (tocRange == null) return;
        
        let editor = window.activeTextEditor;
        let text = this.createTocString(tocRange);
        
        editor.edit(function(edit) {
            edit.replace(tocRange, text);
        });
    }
    
    private deleteToc(tocRange : Range) {
        if (tocRange == null) return;
        
        let editor = window.activeTextEditor;
        
        editor.edit(function(edit) {
            edit.delete(tocRange);
        });
    }
    
    private createTocString(tocRange : Range) {
        let headerList = this.updateHeaderList(tocRange);
        if ((tocRange == null) && (headerList.length <= 0)) {
            return '';
        }
        
        let text = [];
        let indicesOfDepth = Array.apply(null, new Array(this.options.depthTo - this.options.depthFrom + 1)).map(Number.prototype.valueOf, 0);
        text.push('<!-- TOC depthFrom:' + this.options.depthFrom + ' depthTo:' + this.options.depthTo + ' withLinks:' + this.options.withLinks + ' orderedList:' + this.options.orderedList + ' updateOnSave:' + this.options.updateOnSave + ' -->');
        text.push('');
        for (let index = 0; index < headerList.length; index++) {           
            let element = headerList[index];
            let headerContent = element.line.substr(element.depth).trim();
            let row = [];
            row.push('    '.repeat(element.depth - this.options.depthFrom));
            if (this.options.orderedList) {
                row.push(++indicesOfDepth[element.depth - this.options.depthFrom] + ". ");
            } else {
                row.push('- ');
            }
            if (this.options.withLinks) {
                row.push(this.createLink(headerContent));
            } else {
                row.push(headerContent);
            }
            text.push(row.join(''));
        }
        text.push('');
        text.push("<!-- /TOC -->");
        return text.join('\n');
    }
    
    private updateHeaderList(tocRange : Range) {
        let doc = window.activeTextEditor.document;
        let isInTocRange = (index : number) => {
            if (tocRange == null) {
                return false;
            }
            if ((index >= tocRange.start.line) && (index < tocRange.end.line)) {
                return true;
            }
            return false;
        };
        let headerList = [];
        for (let index = 0; index < doc.lineCount; index++) {
            if (isInTocRange(index)) {
                continue;
            }
            let lineText = doc.lineAt(index).text;
            let result = lineText.match(/^\#{1,6}/);
            if ((result != null) && (result[0].length >= this.options.depthFrom) && (result[0].length <= this.options.depthTo)) {
                headerList.push({
                    depth : result[0].length,
                    line : lineText
                });
            }
        }
        return headerList;
    }
    
    private createLink(headername : string) {
        let hash = headername.toLocaleLowerCase();
        hash = hash.replace(/\s+/g, '-');
        hash = hash.replace(/[^a-z0-9\u4e00-\u9fa5äüö\-]/g, '');
        if (hash.indexOf("--") > -1) {
            hash = hash.replace(/(-)+/g, "-");
        }
        if (hash.indexOf(":-") > -1) {
            hash = hash.replace(/:-/g, "-");
        }
        let link = []
        link.push('[');
        link.push(headername);
        link.push('](#');
        link.push(hash)
        link.push(')');
        return link.join('');
    }
    
    private parseValidBool(input : string) {
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