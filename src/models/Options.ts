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

    public getOptionValueByKey(key: string) {
        switch (key.toLowerCase()) {
            case this.DEPTH_FROM.lowerCaseKey:
                return this.DEPTH_FROM.value;
            case this.DEPTH_TO.lowerCaseKey:
                return this.DEPTH_TO.value;
            case this.INSERT_ANCHOR.lowerCaseKey:
                return this.INSERT_ANCHOR.value;
            case this.WITH_LINKS.lowerCaseKey:
                return this.WITH_LINKS.value;
            case this.ORDERED_LIST.lowerCaseKey:
                return this.ORDERED_LIST.value;
            case this.UPDATE_ON_SAVE.lowerCaseKey:
                return this.UPDATE_ON_SAVE.value;
            case this.ANCHOR_MODE.lowerCaseKey:
                return this.ANCHOR_MODE.value;
            case this.BULLET_CHAR.lowerCaseKey:
                return this.BULLET_CHAR.value;
            case this.DETECT_AUTO_SET_SECTION.lowerCaseKey:
                return this.DETECT_AUTO_SET_SECTION.value;
        }
    }
}