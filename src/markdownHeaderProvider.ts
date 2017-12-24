'use strict';

import * as vscode from "vscode";
import * as utils from './utils';
import { MarkdownHeader } from "./markdownHeader";

export class MarkdownHeaderProvider implements vscode.TreeDataProvider<MarkdownHeaderNode>
{

	private tree: MarkdownHeaderNode[] = [];

	private _onDidChangeTreeData: vscode.EventEmitter<MarkdownHeaderNode | undefined> = new vscode.EventEmitter<MarkdownHeaderNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<MarkdownHeaderNode | undefined> = this._onDidChangeTreeData.event;

	constructor() {
		vscode.commands.registerCommand('extension.selectTOCHeader', range => utils.revealLine(range.start.line));
	}

	getTreeItem(element: MarkdownHeaderNode): MarkdownHeaderNode {
		return element;
	}

	getChildren(element?: MarkdownHeaderNode): Thenable<MarkdownHeaderNode[]> {
		if (element) {
			return Promise.resolve(element.childNodes);
		}
		else {
			return Promise.resolve(this.tree);
		}
	}

	setHeaderNodes(nodes: MarkdownHeaderNode[]) {
		this.tree = nodes;
		this._onDidChangeTreeData.fire();
	}

	private generateNode(headers: MarkdownHeader[], rootIndex: number): MarkdownHeaderNode {		
		const curElement = headers[rootIndex];
		let curDepth = curElement.depth
		let childNodes: MarkdownHeaderNode[] = []
		for (let index = rootIndex + 1; index < headers.length; index++) {
			const element = headers[index];
			if (curDepth + 1 === element.depth) {
				childNodes.push(this.generateNode(headers, index));
			}
			else {
				break;
			}
		}
		return new MarkdownHeaderNode(curElement.title,
			(childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
			{
				command: 'extension.selectTOCHeader',
				title: '',
				arguments: [curElement.range]
			},
			childNodes
		)
	}
}

export class MarkdownHeaderNode extends vscode.TreeItem {

	public depth: number;
	public title: string;
	public titleWithLink: string;

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly childNodes?: MarkdownHeaderNode[]
	) {
		super(label, collapsibleState);
	}
}