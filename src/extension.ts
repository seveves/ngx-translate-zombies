'use strict';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Range } from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('ngxtz.check', () => {
    const currentFileName = vscode.window.activeTextEditor.document.fileName;
    if (!currentFileName.endsWith('.json')) {
      vscode.window.showWarningMessage('Expected a JSON file.');
      return;
    }

    if (vscode.workspace.name === undefined) {
      vscode.window.showWarningMessage('This extension must be used in a workspace.');
      return;
    }

    try {
      const langDoc = vscode.window.activeTextEditor.document;
      const text = langDoc.getText();
      const json = JSON.parse(text);
      const keys = getTranslationKeys(json, null, []);
      vscode.workspace.findFiles('**/*.{ts,js,html}', '**/node_modules/**')
        .then((files) => {
          let zombies = [ ...keys ];
          for (let index = 0; index < files.length; index++) {
            const file = files[index];
            zombies = findInFile(file, zombies);
          }

          let unzombified = { ...json };
          for (let index = 0; index < zombies.length; index++) {
            const zombie = zombies[index];
            const zombieKeys = zombie.split('.');
            const prop = zombieKeys.pop();
            const parent = zombieKeys.reduce((obj, key) => obj[key], unzombified);
            delete parent[prop];
          }
          const content = JSON.stringify(unzombified, null, 2);
          vscode.workspace.openTextDocument({ content })
            .then(
              doc => {
                const fileName = langDoc.fileName.replace(vscode.workspace.rootPath, '').substring(1);
                return vscode.commands.executeCommand(
                  'vscode.diff',
                  langDoc.uri,
                  doc.uri,
                  `${fileName} ↔ unzombified`
                )
                .then(
                  ok => {
                    console.log('done');
                  },
                  err => {
                    const errorMessage = 'Error opening diff editor.';
                    vscode.window.showErrorMessage(errorMessage);
                    console.error(errorMessage, err);
                  }
                );
              },
              err => {
                const errorMessage = 'Error opening temporary file.';
                vscode.window.showErrorMessage(errorMessage);
                console.error(errorMessage, err);
              }
            );
        });
    } catch (err) {
      const errorMessage = 'Error while parsing the file: ' + currentFileName;
      vscode.window.showErrorMessage(errorMessage);
      console.error(errorMessage, err);
    }
  });

  context.subscriptions.push(disposable);
}

function findInFile(uri: vscode.Uri, keys: string[]): string[] {
  const zombies = [ ...keys ];
  try {
    const data = fs.readFileSync(uri.fsPath);
    for (const key of keys) {
      const found = data.indexOf(key) !== -1;
      const zombieIndex = zombies.indexOf(key);
      const alreadyZombie = zombieIndex !== -1;
      if (!found && !alreadyZombie) {
        zombies.push(key);
      }
      if (found && alreadyZombie) {
        zombies.splice(zombieIndex, 1);
      }
    }
  } catch (err) {
    console.error('error while reading file: ' + uri.fsPath, err);
  }
  return zombies;
}

function getTranslationKeys(obj: Object, cat: string, tKeys: string[]): string[] {
  const currentKeys = [ ...tKeys ];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'object') {
      currentKeys.push(...getTranslationKeys(value, cat === null ? key : cat.concat('.', key), tKeys));
    } else {
      currentKeys.push(cat === null ? key : cat.concat('.', key));
    }
  }
  return currentKeys;
}

export function deactivate() {
}