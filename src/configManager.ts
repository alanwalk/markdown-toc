import { OptionKeys } from './models/OptionKeys';
import { Options } from './models/Options';
import {
    workspace,
    window,
    Range} from 'vscode';

const extensionName: string = "markdown-toc";
const EOL = require('os').EOL;

export class ConfigManager {

    optionKeys = new OptionKeys();

    options = new Options();

    // language configuration
    lineEnding = <string>workspace.getConfiguration("files", null).get("eol");
    tabSize = <number>workspace.getConfiguration("[markdown]", null)["editor.tabSize"];
    insertSpaces = <boolean>workspace.getConfiguration("[markdown]", null)["editor.insertSpaces"];

    // special characters
    tab = '\t';

    public updateOptions(tocRange: Range | null) {
        this.loadConfigurations();
        this.loadCustomOptions(tocRange);
    }

    public loadConfigurations() {
        this.options.DEPTH_FROM.value = <number>workspace.getConfiguration(extensionName).get(this.options.DEPTH_FROM.key);
        this.options.DEPTH_TO.value = <number>workspace.getConfiguration(extensionName).get(this.options.DEPTH_TO.key);
        this.options.INSERT_ANCHOR.value = <boolean>workspace.getConfiguration(extensionName).get(this.options.INSERT_ANCHOR.key);
        this.options.WITH_LINKS.value = <boolean>workspace.getConfiguration(extensionName).get(this.options.WITH_LINKS.key);
        this.options.ORDERED_LIST.value = <boolean>workspace.getConfiguration(extensionName).get(this.options.ORDERED_LIST.key);
        this.options.UPDATE_ON_SAVE.value = <boolean>workspace.getConfiguration(extensionName).get(this.options.UPDATE_ON_SAVE.key);
        this.options.ANCHOR_MODE.value = <string>workspace.getConfiguration(extensionName).get(this.options.ANCHOR_MODE.key);
        this.options.BULLET_CHAR.value = <string>workspace.getConfiguration(extensionName).get(this.options.BULLET_CHAR.key);

        if (this.lineEnding === 'auto') {
            this.lineEnding = <string>EOL;
        }
        if (this.tabSize === undefined || this.tabSize === null) {
            this.tabSize = <number>workspace.getConfiguration("editor", null).get("tabSize");
        }
        if (this.insertSpaces === undefined || this.insertSpaces === null) {
            this.insertSpaces = <boolean>workspace.getConfiguration("editor", null).get("insertSpaces");
        }

        if (this.insertSpaces && this.tabSize > 0) {
            this.tab = " ".repeat(this.tabSize);
        }
    }

    public loadCustomOptions(tocRange: Range | null) {
        this.options.optionsFlag = [];

        if (tocRange == null) {
            return;
        }

        let editor = window.activeTextEditor;
        if (editor == undefined) {
            return;
        }

        let optionsText = editor.document.lineAt(tocRange.start.line).text;
        let options = optionsText.match(this.optionKeys.REGEXP_TOC_CONFIG);

        if (options == null) {
            return;
        }

        options.forEach(element => {
            let pair = this.optionKeys.REGEXP_TOC_CONFIG_ITEM.exec(element);

            if (pair != null) {
                let key = pair[1].toLocaleLowerCase();
                let value = pair[2];

                switch (key) {
                    case this.options.DEPTH_FROM.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.DEPTH_FROM.value = this.parseValidNumber(value);
                        break;
                    case this.options.DEPTH_TO.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.DEPTH_TO.value = Math.max(this.parseValidNumber(value), this.options.DEPTH_FROM.value);
                        break;
                    case this.options.INSERT_ANCHOR.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.INSERT_ANCHOR.value = this.parseBool(value);
                        break;
                    case this.options.WITH_LINKS.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.WITH_LINKS.value = this.parseBool(value);
                        break;
                    case this.options.ORDERED_LIST.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.ORDERED_LIST.value = this.parseBool(value);
                        break;
                    case this.options.UPDATE_ON_SAVE.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.UPDATE_ON_SAVE.value = this.parseBool(value);
                        break;
                    case this.options.ANCHOR_MODE.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.ANCHOR_MODE.value = this.parseValidAnchorMode(value);
                        break;
                    case this.options.BULLET_CHAR.lowerCaseKey:
                        this.options.optionsFlag.push(key);
                        this.options.BULLET_CHAR.value = value;
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