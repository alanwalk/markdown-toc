import { Dictionary } from './Dictionary';
import { AnchorMode } from './AnchorMode';

export class Options {
    optionsFlag: string[] = [];

    saveBySelf: boolean = false;

    DEPTH_FROM: Dictionary = new Dictionary("depthFrom", 1);
    DEPTH_TO: Dictionary = new Dictionary("depthTo", 6);
    INSERT_ANCHOR: Dictionary = new Dictionary("insertAnchor", false);
    WITH_LINKS: Dictionary = new Dictionary("withLinks", true);
    ORDERED_LIST: Dictionary = new Dictionary("orderedList", false);
    UPDATE_ON_SAVE: Dictionary = new Dictionary("updateOnSave", true);
    ANCHOR_MODE: Dictionary = new Dictionary("anchorMode", AnchorMode.github);
    BULLET_CHAR: Dictionary = new Dictionary("bulletCharacter", "-");

    public getOptionValueByKey(key: string) {
        switch (key.toLowerCase()) {
            case this.DEPTH_FROM.key.toLowerCase():
                return this.DEPTH_FROM.value;
            case this.DEPTH_TO.key.toLowerCase():
                return this.DEPTH_TO.value;
            case this.INSERT_ANCHOR.key.toLowerCase():
                return this.INSERT_ANCHOR.value;
            case this.WITH_LINKS.key.toLowerCase():
                return this.WITH_LINKS.value;
            case this.ORDERED_LIST.key.toLowerCase():
                return this.ORDERED_LIST.value;
            case this.UPDATE_ON_SAVE.key.toLowerCase():
                return this.UPDATE_ON_SAVE.value;
            case this.ANCHOR_MODE.key.toLowerCase():
                return this.ANCHOR_MODE.value;
            case this.BULLET_CHAR.key.toLowerCase():
                return this.BULLET_CHAR.value;
        }
    }
}