export class OptionKeys {
    DEPTH_FROM = "depthFrom";
    DEPTH_TO = "depthTo";
    INSERT_ANCHOR = "insertAnchor";
    WITH_LINKS = "withLinks";
    ORDERED_LIST = "orderedList";
    UPDATE_ON_SAVE = "updateOnSave";
    ANCHOR_MODE = "anchorMode";

    ANCHOR_MODE_LIST = [
        "github.com",
        "bitbucket.org",
        "ghost.org",
        "gitlab.com"
    ];

    LOWER_DEPTH_FROM = this.DEPTH_FROM.toLocaleLowerCase();
    LOWER_DEPTH_TO = this.DEPTH_TO.toLocaleLowerCase();
    LOWER_INSERT_ANCHOR = this.INSERT_ANCHOR.toLocaleLowerCase();
    LOWER_WITH_LINKS = this.WITH_LINKS.toLocaleLowerCase();
    LOWER_ORDERED_LIST = this.ORDERED_LIST.toLocaleLowerCase();
    LOWER_UPDATE_ON_SAVE = this.UPDATE_ON_SAVE.toLocaleLowerCase();
    LOWER_ANCHOR_MODE = this.ANCHOR_MODE.toLocaleLowerCase();

    REGEXP_TOC_START = /\s*<!--(.*)TOC(.*)-->/gi;
    REGEXP_TOC_STOP = /\s*<!--(.*)\/TOC(.*)-->/gi;
    REGEXP_TOC_CONFIG = /\w+[:=][\w.]+/gi;
    REGEXP_TOC_CONFIG_ITEM = /(\w+)[:=]([\w.]+)/;
    REGEXP_MARKDOWN_ANCHOR = /^<a id="markdown-.+" name=".+"><\/a\>/;
    REGEXP_HEADER = /^(\#{1,6})\s*(.+)/;
    REGEXP_CODE_BLOCK1 = /^```/;
    REGEXP_CODE_BLOCK2 = /^~~~/;
    REGEXP_ANCHOR = /\[.+\]\(#(.+)\)/
    REGEXP_IGNORE_TITLE = /<!-- TOC ignore:true -->/
}