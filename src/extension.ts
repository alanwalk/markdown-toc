'use strict';

import * as vscode from 'vscode';
import { MarkdownTocTools } from './markdownTocTools'

export function activate(context: vscode.ExtensionContext) {
    const markdownTocTools = new MarkdownTocTools();

    vscode.commands.registerCommand('extension.updateMarkdownToc', () => markdownTocTools.updateMarkdownToc());
    vscode.commands.registerCommand('extension.deleteMarkdownToc', () => markdownTocTools.deleteMarkdownToc());
    vscode.commands.registerCommand('extension.updateMarkdownSections', () => markdownTocTools.updateMarkdownSections());
    vscode.commands.registerCommand('extension.deleteMarkdownSections', () => markdownTocTools.deleteMarkdownSections());
}
