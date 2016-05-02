# Markdown-TOC
Generate TOC (table of contents) of headlines from parsed [markdown](https://en.wikipedia.org/wiki/Markdown) file.

<!-- TOC depthFrom:2 depthTo:6 withLinks:true orderedList:false updateOnSave:true -->

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Attributes](#attributes)
- [Question?](#question?)
- [License](#license)
- [Source Code](#source-code)

<!-- /TOC -->

## Features
- Auto linking via anchor tags `# A 1` → `#a-1`
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
|withLinks|true or false|true|
|orderedList|true or false|false|
|updateOnSave|true or false|true|

## Question?
Contact with me : 
- Mail : [alanwalk93@gmail.com](mailto:alanwalk93@gmail.com)
- Twitter : [@AlanWalk93](https://twitter.com/AlanWalk93)
- Github : [AlanWalk](https://github.com/AlanWalk)

## License
The package is Open Source Software released under the [License](Liscense). It's developed by AlanWalk.

## Source Code
[Github](https://github.com/AlanWalk/Markdown-TOC)