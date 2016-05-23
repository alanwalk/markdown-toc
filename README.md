# Markdown-TOC
Generate TOC (table of contents) of headlines from parsed [markdown](https://en.wikipedia.org/wiki/Markdown) file.

<!-- TOC depthFrom:2 depthTo:6 insertAnchor:false orderedList:false updateOnSave:true withLinks:true -->

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Attributes](#attributes)
- [ChangeLog](#changelog)
- [Contributors](#contributors)
- [Question](#question)
- [License](#license)
- [Links](#links)

<!-- /TOC -->

## Features
- Auto active plugin on markdown
- Insert anchor for header `<a id="markdown-header" name="header"></a>`
- Linking via anchor tags `# A 1` → `#a-1`
- Depth control[1-6] with `depthFrom:1` and `depthTo:6`
- Enable or disable links with `withLinks:true`
- Refresh list on save with `updateOnSave:true`
- Use ordered list (1. ..., 2. ...) with `orderedList:true`

## Installation
```
ext install markdown-toc
```

## Usage
1. Open Markdown files.
1. Move cursor to position where you want to insert TOC.
1. Ctrl+Shift+P / F1.
1. Input 'TOC Create'.
1. TOC has inserted into document!

## Attributes
|attributes|values|defaults|
|---|---|---|
|depthFrom|uint(1-6)|1|
|depthTo|uint(1-6)|6|
|insertAnchor|true or false|false|
|withLinks|true or false|true|
|orderedList|true or false|false|
|updateOnSave|true or false|true|

## ChangeLog
**1.1.1**
- Update : Just update document

**1.1.0**
- Add : Auto active extensions on markdown
- Add : Auto insert anchor for header
- Fix : Update on save is valid on other language

## Contributors
rovest (Feature: insert anchor)

## Question
If you have any question, you can contact with me: 
- Mail : [alanwalk93@gmail.com](mailto:alanwalk93@gmail.com)
- Twitter : [@AlanWalk93](https://twitter.com/AlanWalk93)
- Github : [AlanWalk](https://github.com/AlanWalk)

## License
The package is Open Source Software released under the [License](Liscense). It's developed by AlanWalk.

## Links
- [Source Code](https://github.com/AlanWalk/Markdown-TOC)
- [Market](https://marketplace.visualstudio.com/items/AlanWalk.markdown-toc)