
'use strict';

import * as vscode from "vscode";

export class MarkdownHeader {
    depth       : number;
    title       : string;
    hash        : string;
    header      : string;
    orderedList : string;
    baseTitle   : string;
    range       : vscode.Range;
}