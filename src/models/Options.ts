import { OptionKeys } from './OptionKeys';

const optionKeys = new OptionKeys();

export class Options {
    DEPTH_FROM:number = 1;
    DEPTH_TO:number = 6;
    INSERT_ANCHOR:boolean = false;
    WITH_LINKS:boolean = true;
    ORDERED_LIST:boolean = false;
    UPDATE_ON_SAVE:boolean = true;
    ANCHOR_MODE:string = optionKeys.ANCHOR_MODE_LIST[0];

    optionsFlag: string[] = [];

    saveBySelf:boolean = false;
}