import {
    commands,
    ExtensionContext,
    workspace
} from 'vscode';

import { MarkdownTocTools } from './MarkdownTocTools';

export function activate(context: ExtensionContext) {

    // create a MarkdownTocTools
    let markdownTocTools = new MarkdownTocTools();

    let disposable_updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', () => { markdownTocTools.updateMarkdownToc(); });
    let disposable_deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => { markdownTocTools.deleteMarkdownToc(); });
    let disposable_updateMarkdownSections = commands.registerCommand('extension.updateMarkdownSections', () => { markdownTocTools.updateMarkdownSections(); });
    let disposable_deleteMarkdownSections = commands.registerCommand('extension.deleteMarkdownSections', () => { markdownTocTools.deleteMarkdownSections(); });
    let disposable_saveMarkdownToc = workspace.onDidSaveTextDocument(() => { markdownTocTools.notifyDocumentSave(); });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(disposable_updateMarkdownToc);
    context.subscriptions.push(disposable_deleteMarkdownToc);
    context.subscriptions.push(disposable_updateMarkdownSections);
    context.subscriptions.push(disposable_deleteMarkdownSections);
    context.subscriptions.push(disposable_saveMarkdownToc);
}