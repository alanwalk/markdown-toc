import {
    commands,
    ExtensionContext,
    workspace
} from 'vscode';

import { AutoMarkdownToc } from './AutoMarkdownToc';

export function activate(context: ExtensionContext) {

    // create a AutoMarkdownToc
    let autoMarkdownToc = new AutoMarkdownToc();

    let disposable_updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', () => { autoMarkdownToc.updateMarkdownToc(); });
    let disposable_deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => { autoMarkdownToc.deleteMarkdownToc(); });
    let disposable_updateMarkdownSections = commands.registerCommand('extension.updateMarkdownSections', () => { autoMarkdownToc.updateMarkdownSections(); });
    let disposable_deleteMarkdownSections = commands.registerCommand('extension.deleteMarkdownSections', () => { autoMarkdownToc.deleteMarkdownSections(); });
    // let disposable_saveMarkdownToc = workspace.onDidSaveTextDocument(() => { autoMarkdownToc.notifyDocumentSave(); });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(disposable_updateMarkdownToc);
    context.subscriptions.push(disposable_deleteMarkdownToc);
    context.subscriptions.push(disposable_updateMarkdownSections);
    context.subscriptions.push(disposable_deleteMarkdownSections);
    // context.subscriptions.push(disposable_saveMarkdownToc);
}

// this method is called when your extension is deactivated
export function deactivate() {}