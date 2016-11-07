# Markdown-TOC
Generate TOC (table of contents) of headlines from parsed [markdown](https://en.wikipedia.org/wiki/Markdown) file.

<!-- TOC depthFrom:2 -->

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
    - [Default Settings](#default-settings)
    - [Unique Settings](#unique-settings)
- [Contributors](#contributors)
- [Change Log](#change-log)
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
- Anchor support for (github.com|nodejs.org|bitbucket.org|ghost.org|gitlab.com).

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

## Configuration
|attributes|values|defaults|
|---|---|---|
|depthFrom|uint(1-6)|1|
|depthTo|uint(1-6)|6|
|insertAnchor|bool|false|
|withLinks|bool|true|
|orderedList|bool|false|
|updateOnSave|bool|true|
|anchorMode|(github.com|nodejs.org|bitbucket.org|ghost.org|gitlab.com)|github.com|

### Default Settings
To change the default configuration settings for the Markdown-TOC extension, edit the user or workspace settings as described here. The available settings are as follows:

|attributes|values|defaults|
|---|---|---|
|markdown-toc.depthFrom|number(1-6)|1|
|markdown-toc.depthTo|number(1-6)|6|
|markdown-toc.insertAnchor|bool|false|
|markdown-toc.withLinks|bool|true|
|markdown-toc.orderedList|bool|false|
|markdown-toc.updateOnSave|bool|true|
|markdown-toc.anchorMode|enum|github.com|

### Unique Settings
If you want to use a unique setting for a file, you can add attributes to `<!-- TOC -->` , just like:
```
<!-- TOC depthFrom:2 orderedList:true -->

<!-- /TOC -->
```

## Contributors
- chriscamicas (Update: Anchor generation)
- kevindaub (Add : Use Workspace Settings for Tabs and EOL)
- rovest (Feature: Insert anchor)
- zhiguang Wang(Fix: Recognised code to header list)
- jgroom33 (Fix: Codeblock error)
- satokaz (Fix: Codeblock error)

## Change Log
[Change Log](https://github.com/AlanWalk/Markdown-TOC/blob/master/CHANGELOG.md)

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
