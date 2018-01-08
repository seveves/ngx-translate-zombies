# ngx-translate-zombies

This extension should be used withe angular translation library [ngx-translate](https://github.com/ngx-translate/core)
It searches translation keys (normally located in a [language-code].json file) in .ts, .js or .html files
in the current workspace and shows unused keys inside a diff editor.

## Features

When having a ngx-translate translation file opened, you can hit F1 and type ```ngxtz: find translation zombies in this file```.
A diff editor will be openend showing the recommended changes. That's it.

## Contribute / Bugs / Feature Requests / Help

Create your issues [here](https://github.com/seveves/ngx-translate-zombies)

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

No settings yet.

## Known Issues

No issues yet.

## Release Notes

### 0.0.1
Basis features added (searching zombies, showing diff)
