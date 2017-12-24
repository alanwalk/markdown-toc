'use strict';

import * as vscode from 'vscode';

export function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

export function parseBool(value: string): boolean {
    return value.toLocaleLowerCase() === 'true';
}

export function isMarkdown(document: vscode.TextDocument): boolean {
    return document.languageId === 'markdown';
}

export function revealLine(line: number) {
    let reviewType: vscode.TextEditorRevealType = vscode.TextEditorRevealType.InCenter;
    if (line === vscode.window.activeTextEditor.selection.active.line) {
        reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
    }
    let selection = new vscode.Selection(line, 0, line, 0);
    vscode.window.activeTextEditor.selection = selection;
    vscode.window.activeTextEditor.revealRange(selection, reviewType);
}