import { OptionKeys } from './models/OptionKeys';
import {
    workspace,
    window,
    Range
} from 'vscode'

export class ConfigManager {

    optionKeys = new OptionKeys();

    options = {
        DEPTH_FROM: 1,
        DEPTH_TO: 6,
        INSERT_ANCHOR: false,
        WITH_LINKS: true,
        ORDERED_LIST: false,
        UPDATE_ON_SAVE: true,
        ANCHOR_MODE: this.optionKeys.ANCHOR_MODE_LIST[0]
    };

    optionsFlag: string[] = [];

    public updateOptions(tocRange: Range | null) {
        this.loadConfigurations();
        this.loadCustomOptions(tocRange);
    }

    public loadConfigurations() {
        this.options.DEPTH_FROM = <number>workspace.getConfiguration('markdown-toc').get('depthFrom');
        this.options.DEPTH_TO = <number>workspace.getConfiguration('markdown-toc').get('depthTo');
        this.options.INSERT_ANCHOR = <boolean>workspace.getConfiguration('markdown-toc').get('insertAnchor');
        this.options.WITH_LINKS = <boolean>workspace.getConfiguration('markdown-toc').get('withLinks');
        this.options.ORDERED_LIST = <boolean>workspace.getConfiguration('markdown-toc').get('orderedList');
        this.options.UPDATE_ON_SAVE = <boolean>workspace.getConfiguration('markdown-toc').get('updateOnSave');
        this.options.ANCHOR_MODE = <string>workspace.getConfiguration('markdown-toc').get('anchorMode');
    }

    public loadCustomOptions(tocRange: Range | null) {
        this.optionsFlag = [];
        if (tocRange == null || tocRange == null) return;
        let editor = window.activeTextEditor;
        if (editor == undefined) return;
        let optionsText = editor.document.lineAt(tocRange.start.line).text;
        let options = optionsText.match(this.optionKeys.REGEXP_TOC_CONFIG);
        if (options == null) return;

        options.forEach(element => {
            let pair = this.optionKeys.REGEXP_TOC_CONFIG_ITEM.exec(element)

            if (pair != null) {
                let key = pair[1].toLocaleLowerCase();
                let value = pair[2];

                switch (key) {
                    case this.optionKeys.LOWER_DEPTH_FROM:
                        this.optionsFlag.push(this.optionKeys.DEPTH_FROM);
                        this.options.DEPTH_FROM = this.parseValidNumber(value);
                        break;
                    case this.optionKeys.LOWER_DEPTH_TO:
                        this.optionsFlag.push(this.optionKeys.DEPTH_TO);
                        this.options.DEPTH_TO = Math.max(this.parseValidNumber(value), this.options.DEPTH_FROM);
                        break;
                    case this.optionKeys.LOWER_INSERT_ANCHOR:
                        this.optionsFlag.push(this.optionKeys.INSERT_ANCHOR);
                        this.options.INSERT_ANCHOR = this.parseBool(value);
                        break;
                    case this.optionKeys.LOWER_WITH_LINKS:
                        this.optionsFlag.push(this.optionKeys.WITH_LINKS);
                        this.options.WITH_LINKS = this.parseBool(value);
                        break;
                    case this.optionKeys.LOWER_ORDERED_LIST:
                        this.optionsFlag.push(this.optionKeys.ORDERED_LIST);
                        this.options.ORDERED_LIST = this.parseBool(value);
                        break;
                    case this.optionKeys.LOWER_UPDATE_ON_SAVE:
                        this.optionsFlag.push(this.optionKeys.UPDATE_ON_SAVE);
                        this.options.UPDATE_ON_SAVE = this.parseBool(value);
                        break;
                    case this.optionKeys.LOWER_ANCHOR_MODE:
                        this.optionsFlag.push(this.optionKeys.ANCHOR_MODE);
                        this.options.ANCHOR_MODE = this.parseValidAnchorMode(value);
                        break;
                }
            }

        });
    }

    private parseBool(value: string) {
        return value.toLocaleLowerCase() == 'true';
    }

    private parseValidNumber(value: string) {
        let num = parseInt(value);
        if (num < 1) {
            return 1;
        }
        if (num > 6) {
            return 6;
        }
        return num;
    }

    private parseValidAnchorMode(value: string) {

        if (this.optionKeys.ANCHOR_MODE_LIST.indexOf(value) != -1) {
            return value;
        }

        return this.optionKeys.ANCHOR_MODE_LIST[0];
    }
}