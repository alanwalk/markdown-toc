'use strict';

import * as vscode from 'vscode';
import * as utils from './utils';

enum AnchorMode {
    Github      = "github.com",
    Bitbucket   = "bitbucket.org",
    Ghost       = "ghost.org",
    Gitlab      = "gitlab.com"
}

const MIN_HEADER_DEPTH = 1
const MAX_HEADER_DEPTH = 6
const REGEXP_TOC_CONFIG = /\w+[:=][\w.]+/gi;
const REGEXP_TOC_CONFIG_ITEM = /(\w+)[:=]([\w.]+)/;

const DEPTH_FROM        = "depthFrom";
const DEPTH_TO          = "depthTo";
const INSERT_ANCHOR     = "insertAnchor";
const WITH_LINKS        = "withLinks";
const ORDERED_LIST      = "orderedList";
const UPDATE_ON_SAVE    = "updateOnSave";
const ANCHOR_MODE       = "anchorMode";

const LOWER_DEPTH_FROM      = DEPTH_FROM.toLocaleLowerCase();
const LOWER_DEPTH_TO        = DEPTH_TO.toLocaleLowerCase();
const LOWER_INSERT_ANCHOR   = INSERT_ANCHOR.toLocaleLowerCase();
const LOWER_WITH_LINKS      = WITH_LINKS.toLocaleLowerCase();
const LOWER_ORDERED_LIST    = ORDERED_LIST.toLocaleLowerCase();
const LOWER_UPDATE_ON_SAVE  = UPDATE_ON_SAVE.toLocaleLowerCase();
const LOWER_ANCHOR_MODE     = ANCHOR_MODE.toLocaleLowerCase();

export class MarkdownConfigs {
    depthFrom       : number        = 1;
    depthTo         : number        = 6;
    insertAnchor    : boolean       = false;
    withLinks       : boolean       = true;
    orderedList     : boolean       = false;
    updateOnSave    : boolean       = true;
    anchorMode      : AnchorMode    = AnchorMode.Github;

    constructor() {
        this.updateConfig();
        vscode.workspace.onDidChangeConfiguration(() => this.updateConfig());
    }

    updateConfig() {
        const configuration = vscode.workspace.getConfiguration('markdown-toc')
        this.depthFrom      = configuration.get<number>(DEPTH_FROM);
        this.depthTo        = configuration.get<number>(DEPTH_TO);
        this.insertAnchor   = configuration.get<boolean>(INSERT_ANCHOR);
        this.withLinks      = configuration.get<boolean>(WITH_LINKS);
        this.orderedList    = configuration.get<boolean>(ORDERED_LIST);
        this.updateOnSave   = configuration.get<boolean>(UPDATE_ON_SAVE);
        this.anchorMode     = configuration.get<AnchorMode>(ANCHOR_MODE);
    }

    setConfig(configString : string) {
        const configs = configString.toLocaleLowerCase().match(REGEXP_TOC_CONFIG);
        if (configs === null) return;

        configs.forEach(element => {
            const pair = REGEXP_TOC_CONFIG_ITEM.exec(element)
            const key = pair[1]
            const value = pair[2];
            switch (key) {
                case LOWER_DEPTH_FROM:
                    this.depthFrom = utils.clamp(parseInt(value), MIN_HEADER_DEPTH, MAX_HEADER_DEPTH);
                    break;
                case LOWER_DEPTH_TO:
                    this.depthTo = utils.clamp(parseInt(value), MIN_HEADER_DEPTH, this.depthFrom);
                    break;
                case LOWER_INSERT_ANCHOR:
                    this.insertAnchor = utils.parseBool(value);
                    break;
                case LOWER_WITH_LINKS:
                    this.withLinks = utils.parseBool(value);
                    break;
                case LOWER_ORDERED_LIST:
                    this.orderedList = utils.parseBool(value);
                    break;
                case LOWER_UPDATE_ON_SAVE:
                    this.updateOnSave = utils.parseBool(value);
                    break;
                case LOWER_ANCHOR_MODE:
                    this.anchorMode = <AnchorMode>value;
                    break;
            }
        });
    }

    getConfigString() : string {
        return ''
    }
}