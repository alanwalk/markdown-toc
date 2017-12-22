'use strict';

import * as vscode from "vscode";

export class MarkdownHeaderProvider implements vscode.TreeDataProvider<MarkdownHeaderNode>
{

	private tree: MarkdownHeaderNode[] = [];

	private _onDidChangeTreeData: vscode.EventEmitter<MarkdownHeaderNode | undefined> = new vscode.EventEmitter<MarkdownHeaderNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<MarkdownHeaderNode | undefined> = this._onDidChangeTreeData.event;

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

	revealHeader(range: vscode.Range) {
		let line = range.start.line + 19
        let reviewType: vscode.TextEditorRevealType = vscode.TextEditorRevealType.InCenter;
        if (line === vscode.window.activeTextEditor.selection.active.line) {
            reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
        }
        let newSe = new vscode.Selection(line, 0, line, 0);
        vscode.window.activeTextEditor.selection = newSe;
        vscode.window.activeTextEditor.revealRange(newSe, reviewType);
	}

	updateHeaderList(headerList) {
		this.tree = [];
		let minDepth = 6;
		headerList.forEach(element => {
			minDepth = Math.min(element.depth, minDepth);
		});
		for (let index = 0; index < headerList.length; index++) {
			const element = headerList[index];
			if (element.depth == minDepth) {
				this.tree.push(this.generateNode(headerList, index));
			}
		}
		// for (let index = 0; index < headerList.length; index++) {
		// 	const element = headerList[index];
		// 	this.tree.push(new MarkdownHeaderNode("#".repeat(element.depth) + element.title,
		// 		vscode.TreeItemCollapsibleState.None,
		// 		{
		// 			command: 'extension.selectTOCHeader',
		// 			title: '',
		// 			arguments: [element.range]
		// 		}
		// 	));
		// }
		this._onDidChangeTreeData.fire();
	}

	private generateNode(headerList, rootIndex): MarkdownHeaderNode {		
		const curElement = headerList[rootIndex];
		let curDepth = curElement.depth
		let childNodes: MarkdownHeaderNode[] = []
		for (let index = rootIndex + 1; index < headerList.length; index++) {
			const element = headerList[index];
			if (curDepth + 1 == element.depth) {
				childNodes.push(this.generateNode(headerList, index));
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

class MarkdownHeaderNode extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly childNodes?: MarkdownHeaderNode[]
	) {
		super(label, collapsibleState);
	}
}