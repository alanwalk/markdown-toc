import {
    commands,
    ExtensionContext,
    workspace
} from 'vscode';

import { AutoMarkdownToc } from './AutoMarkdownToc';

export function activate(context: ExtensionContext) {

    // create a AutoMarkdownToc
    let autoMarkdownToc = new AutoMarkdownToc();

    let updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', () => { autoMarkdownToc.updateMarkdownToc(); });
    let deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => { autoMarkdownToc.deleteMarkdownToc(); });
    let updateMarkdownSections = commands.registerCommand('extension.updateMarkdownSections', () => { autoMarkdownToc.updateMarkdownSections(); });
    let deleteMarkdownSections = commands.registerCommand('extension.deleteMarkdownSections', () => { autoMarkdownToc.deleteMarkdownSections(); });

    // Events
    let saveMarkdownToc = workspace.onDidSaveTextDocument(() => { autoMarkdownToc.onDidSaveTextDocument(); });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(updateMarkdownToc);
    context.subscriptions.push(deleteMarkdownToc);
    context.subscriptions.push(updateMarkdownSections);
    context.subscriptions.push(deleteMarkdownSections);

    context.subscriptions.push(saveMarkdownToc);
}

// this method is called when your extension is deactivated
export function deactivate() { }