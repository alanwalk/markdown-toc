export class RegexStrings {
    REGEXP_TOC_START = /\s*<!--(.*)[^\/]TOC(.*)-->/gi;
    REGEXP_TOC_STOP = /\s*<!--(.*)\/TOC(.*)-->/gi;
    REGEXP_TOC_CONFIG = /\w+[:=][\w.]+/gi;
    REGEXP_TOC_CONFIG_ITEM = /(\w+)[:=]([\w.]+)/;
    REGEXP_MARKDOWN_ANCHOR = /^<a id="markdown-.+" name=".+"><\/a\>/;
    REGEXP_HEADER = /^(\#{1,6})\s*(.+)/;
    REGEXP_CODE_BLOCK1 = /^```/;
    REGEXP_CODE_BLOCK2 = /^~~~/;
    REGEXP_ANCHOR = /\[.+\]\(#(.+)\)/;
    REGEXP_IGNORE_TITLE = /<!-- TOC ignore:true -->/;
    REGEXP_HEADER_META = /^(\#*)\s*((\d*\.?)*)\s*(.+)/;
}