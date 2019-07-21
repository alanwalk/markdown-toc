import { OptionKeys } from './OptionKeys';
import { Dictionary } from './Dictionary';
// import defaultSettings from '../data/defaultSettings.json';

const optionKeys = new OptionKeys();

export class Options {
    optionsFlag: string[] = [];

    saveBySelf: boolean = false;

    DEPTH_FROM: Dictionary = new Dictionary("depthFrom", 1);
    DEPTH_TO: Dictionary = new Dictionary("depthTo", 6);
    INSERT_ANCHOR: Dictionary = new Dictionary("insertAnchor", false);
    WITH_LINKS: Dictionary = new Dictionary("withLinks", true);
    ORDERED_LIST: Dictionary = new Dictionary("orderedList", false);
    UPDATE_ON_SAVE: Dictionary = new Dictionary("updateOnSave", true);
    ANCHOR_MODE: Dictionary = new Dictionary("anchorMode", optionKeys.ANCHOR_MODE_LIST[0]);

    // settings: Dictionary[] = defaultSettings;

    public getOptionValueByKey(key: string) {
        switch (key) {
            case this.DEPTH_FROM.key:
                return this.DEPTH_FROM.value;
            case this.DEPTH_TO.key:
                return this.DEPTH_TO.value;
            case this.INSERT_ANCHOR.key:
                return this.INSERT_ANCHOR.value;
            case this.WITH_LINKS.key:
                return this.WITH_LINKS.value;
            case this.ORDERED_LIST.key:
                return this.ORDERED_LIST.value;
            case this.UPDATE_ON_SAVE.key:
                return this.UPDATE_ON_SAVE.value;
            case this.ANCHOR_MODE.key:
                return this.ANCHOR_MODE.value;
        }
    }

    // public getSettingByKey(key: string) {
    //     let settingIndex = this.settings.findIndex(item => item.lowerCaseKey == key.toLocaleLowerCase());
    //     if (settingIndex > -1) {
    //         return this.settings[settingIndex];
    //     }

    //     return undefined;
    // }

    // public getSettingValueByKey(key: string) {
    //     let setting = this.getSettingByKey(key);
    //     if (setting != undefined) {
    //         return setting.value;
    //     }

    //     return undefined;
    // }
}