# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.2] - 2019-12-03
### Fixed:
- Set default detecting and auto insert section number to FALSE

## [2.2.2] - 2019-08-22
### Fixed:
- Ignore 'header' in code block

## [2.2.1] - 2019-08-21
### Fixed:
- Custom options for each document is now working as expected.

## [2.2.0] - 2019-08-19
### Added:
- When anchor mode is bitbucket, the anchor will be rendered above the header.

## [2.1.4] - 2019-08-18
### Fixed:
- Error when markdown document is not ending with a newline.

## [2.1.3] - 2019-08-17
### Added:
- Conditions for key bindings.

## [2.1.2] - 2019-08-17
### Fixed:
- Ordered number is wrong.
- Some typo in readme and changelog.

## [2.1.1] - 2019-07-23
### Fixed:
- Header with anchor now rendered with colors as default of vscode

## [2.1.0] - 2019-07-23
### Changed
- Source code break down to functions and classess for easy maintainance and extension.

### Added
- Custom bullet character for TOC using markdown-toc.bulletCharacter setting.

## [2.0.0] - 2019-07-19
### Fixed:
- All TSLINT errors now fixed and (hopfully) working as original code.

## [1.6.1] - 2019-07-19
### Fixed:
- EOL (End of line) now respect the auto setting by [roborourke](https://github.com/roborourke/markdown-toc.git)

## [1.6.0] - 2017-07-25
### Added
- A way to ignore certain headings.

### Fixed
- Fixed anchors may have invalid chars that break the links.

## [1.5.6] - 2017-07-25
### Fixed
- Fixed wrong section number.
- Fixed depthTo option is not recognized.

## [1.5.5] - 2017-05-23
### Fixed
- Fixed code block using tildes is not in code (kentakei's code).

## [1.5.4] - 2017-05-18
### Fixed
- Fixed section header numbering not resetting (CapitalistHippie's code).

## [1.5.3] - 2017-05-18
### Changed
- This is a error commit.

## [1.5.2] - 2017-05-10
### Changed
- Using `tabSize` and `insertSpaces` from `[markdown]` configuration (junian's code).
- Only display right click menus when editing markdown files (junian's code).

## [1.5.1] - 2017-03-25
### Fixed
- Inserted anchor is correct.

## [1.5.0] - 2017-02-21
### Added
- Insert / Delete header number sections.
- Keyboard shortcuts.
- Editor context menus.

### Fixed
- Can't remove all custom option.

### Removed
- Anchor mode is not support nodejs.

## [1.4.6] - 2017-01-17
### Fixed
- Identical headers will link to first occurrence in text.

## [1.4.5] - 2017-01-16
### Fixed
- OrderedList option should reset sub-order.

## [1.4.4] - 2017-01-16
### Changed
- Decode Unicode for anchor.

## [1.4.3] - 2016-11-11
### Changed
- Support header lines with trailing slashes (MarioSchwalbe's code).

## [1.4.2] - 2016-11-07
### Fixed
- Modify Dependencies.

## [1.4.1] - 2016-11-07
### Fixed
- Modify Dependencies.

## [1.4.0] - 2016-11-07
### Added
- Add anchor mode, you can use anchor in other site.
### Changed
- Based on GitHub markdown anchor generation (chriscamicas's code).

## [1.3.0] - 2016-08-23
### Added
- Use Workspace Settings for Tabs and EOL (kevindaub's code).
### Changed
- Auto remove extra space when depthFrom is not startFrom.

## [1.2.3] - 2016-08-21
### Fixed
- Error when none attributes.

## [1.2.2] - 2016-07-18
### Changed
- Just update document.

## [1.2.1] - 2016-07-18
### Changed
- Remove attributes in<!-- TOC -->.
### Fixed
- DepthTo is not valid.

## [1.2.0] - 2016-07-18
### Added
- Load default config from vscode settings.

## [1.1.3] - 2016-06-14
### Fixed
- Codeblock error.

## [1.1.2] - 2016-05-23
### Fixed
- Recognized code to header list.
- Delete anchor failed sometime.

## [1.1.1] - 2016-05-23
### Changed
- Just update document.

## [1.1.0] - 2016-05-22
### Added
- Auto active extensions on markdown.
- Auto insert anchor for header.

### Fixed
- Update on save is valid on other language.

## [1.0.0] - 2016-05-01
### Added
- All basic function.
