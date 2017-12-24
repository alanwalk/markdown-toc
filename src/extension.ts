'use strict';

import * as vscode from 'vscode';
import { MarkdownTocTools } from './markdownTocTools'

export function activate(context: vscode.ExtensionContext) {
    const markdownTocTools = new MarkdownTocTools();

    vscode.commands.registerCommand('extension.updateMarkdownToc', () => markdownTocTools.updateToc());
    vscode.commands.registerCommand('extension.deleteMarkdownToc', () => markdownTocTools.deleteToc());
    vscode.commands.registerCommand('extension.updateMarkdownSections', () => markdownTocTools.updateSections());
    vscode.commands.registerCommand('extension.deleteMarkdownSections', () => markdownTocTools.deleteSections());    
}
