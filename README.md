# Auto Markdown TOC
<a id="markdown-auto-markdown-toc" name="auto-markdown-toc"></a>
Generate TOC (table of contents) of headlines from parsed [markdown](https://en.wikipedia.org/wiki/Markdown) file.

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/huntertran.auto-markdown-toc.svg)](https://marketplace.visualstudio.com/items?itemName=huntertran.auto-markdown-toc)
[![Rating](https://vsmarketplacebadge.apphb.com/rating/huntertran.auto-markdown-toc.svg)](https://marketplace.visualstudio.com/items?itemName=huntertran.auto-markdown-toc)
![Build Status](https://github.com/huntertran/markdown-toc/workflows/Node%20CI/badge.svg)

<!-- TOC depthfrom:2 -->

- [1. Features](#1-features)
- [2. Installation](#2-installation)
- [3. Usage](#3-usage)
    - [3.1. Insert TOC](#31-insert-toc)
    - [3.2. Insert Header Number Sections](#32-insert-header-number-sections)
- [4. Configuration](#4-configuration)
    - [4.1. Default Settings](#41-default-settings)
    - [4.2. Unique Settings](#42-unique-settings)
- [5. Contributors](#5-contributors)
- [6. What's New?](#6-whats-new)
- [7. Authors](#7-authors)
- [8. License](#8-license)
- [9. Links](#9-links)

<!-- /TOC -->

## 1. Features
<a id="markdown-1-features" name="1-features"></a>
- Insert header number sections.
- Auto active plugin on markdown
- Insert anchor for header `<a id="markdown-header" name="header"></a>`
- Linking via anchor tags `# A 1` → `#a-1`
- Depth control[1-6] with `depthFrom:1` and `depthTo:6`
- Enable or disable links with `withLinks:true`
- Refresh list on save with `updateOnSave:true`
- Use ordered list (1. ..., 2. ...) with `orderedList:true`
- Anchor support for (github.com|nodejs.org|bitbucket.org|ghost.org|gitlab.com).

## 2. Installation
<a id="markdown-2-installation" name="2-installation"></a>

```
ext install auto-markdown-toc
```

## 3. Usage
<a id="markdown-3-usage" name="3-usage"></a>

### 3.1. Insert TOC
<a id="markdown-31-insert-toc" name="31-insert-toc"></a>

![Insert TOC](img/insert-toc.gif)

### 3.2. Insert Header Number Sections
<a id="markdown-32-insert-header-number-sections" name="32-insert-header-number-sections"></a>

**Tips:Section of header is begin with depthFrom**

![Insert Header Number Sections](img/insert-header-number-sections.gif)

## 4. Configuration
<a id="markdown-4-configuration" name="4-configuration"></a>

|attributes|values|defaults|
|---|---|---|
|depthFrom|uint(1-6)|1|
|depthTo|uint(1-6)|6|
|bulletCharacter|string|"-"|
|insertAnchor|bool|false|
|withLinks|bool|true|
|orderedList|bool|false|
|updateOnSave|bool|true|
|anchorMode|github.com/bitbucket.org/ghost.org/gitlab.com|github.com|

### 4.1. Default Settings
<a id="markdown-41-default-settings" name="41-default-settings"></a>

To change the default configuration settings for the `Auto Markdown TOC` extension, edit the user or workspace settings as described here. The available settings are as follows:

|attributes|values|defaults|
|---|---|---|
|markdown-toc.depthFrom|number|1|
|markdown-toc.depthTo|number|6|
|markdown-toc.bulletCharacter|string|"-"|
|markdown-toc.insertAnchor|bool|false|
|markdown-toc.withLinks|bool|true|
|markdown-toc.orderedList|bool|false|
|markdown-toc.updateOnSave|bool|true|
|markdown-toc.anchorMode|enum|github.com|

### 4.2. Unique Settings
<a id="markdown-42-unique-settings" name="42-unique-settings"></a>
If you want to use a unique setting for a file, you can add attributes to `<!-- TOC -->` , just like:

```
<!-- TOC depthFrom:2 orderedList:true -->

<!-- /TOC -->
```

## 5. Contributors
<a id="markdown-5-contributors" name="5-contributors"></a>
- sine sawtooth (Add: Header number section)
- chriscamicas (Update: Anchor generation)
- kevindaub (Add : Use workspace settings for tabs and eOL)
- rovest (Feature: Insert anchor)
- zhiguang Wang(Fix: Recognized code to header list)
- jgroom33 (Fix: Codeblock error)
- satokaz (Fix: Codeblock error)

## 6. What's New?
<a id="markdown-6-whats-new" name="6-whats-new"></a>
[CHANGELOG](https://github.com/huntertran/markdown-toc/blob/master/CHANGELOG.md)


## 7. Authors
<a id="markdown-7-authors" name="7-authors"></a>

This forked repository is maintained by me and anyone who would like to contribute. The EOL fixed was contributed by [roborourke](https://github.com/roborourke/markdown-toc.git) and any one open new pull request with the hope of fixing the problem.

The original code is created by Alan Walk. If you have any questions, contact him at:
- Mail : [alanwalk93@gmail.com](mailto:alanwalk93@gmail.com)
- Twitter : [@AlanWalk93](https://twitter.com/AlanWalk93)
- Github : [AlanWalk](https://github.com/AlanWalk)

## 8. License
<a id="markdown-8-license" name="8-license"></a>
The package is Open Source Software released under the [MIT License](LICENSE). It's developed by AlanWalk, maintained by Hunter Tran

## 9. Links
<a id="markdown-9-links" name="9-links"></a>
- [Source Code](https://github.com/huntertran/markdown-toc)
- [Market](https://marketplace.visualstudio.com/items?itemName=huntertran.auto-markdown-toc)
