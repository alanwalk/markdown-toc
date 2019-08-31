import { Dictionary } from './Dictionary';
import { AnchorMode } from './AnchorMode';

export class Options {

    // current document options
    optionsFlag: string[] = [];
    isProgrammaticallySave: boolean = false;
    isOrderedListDetected: boolean = false;

    // workspace settings
    DEPTH_FROM: Dictionary = new Dictionary("depthFrom", 1);
    DEPTH_TO: Dictionary = new Dictionary("depthTo", 6);
    INSERT_ANCHOR: Dictionary = new Dictionary("insertAnchor", false);
    WITH_LINKS: Dictionary = new Dictionary("withLinks", true);
    ORDERED_LIST: Dictionary = new Dictionary("orderedList", false);
    UPDATE_ON_SAVE: Dictionary = new Dictionary("updateOnSave", true);
    ANCHOR_MODE: Dictionary = new Dictionary("anchorMode", AnchorMode.github);
    BULLET_CHAR: Dictionary = new Dictionary("bulletCharacter", "-");
    DETECT_AUTO_SET_SECTION: Dictionary = new Dictionary("detectAndAutoSetSection", true);

    extensionName: string = "markdown-toc";
    EOL = require('os').EOL;

    // language configuration
    lineEnding: string = "";
    tabSize: number = 2;
    insertSpaces: boolean = false;
    autoSave: boolean = false;

    // special characters
    tab = '\t';
}