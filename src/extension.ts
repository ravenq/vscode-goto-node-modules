import * as fs from "fs";
import * as vscode from 'vscode';

class NodeModuleDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Definition> {
    const fileName = document.fileName;
    const rootPath = vscode.workspace.rootPath;

    const text: string = document.getText();
    const line: vscode.TextLine = document.lineAt(position);
    let word: string | null = null;
    // packages.json
    if (/package\.json$/.test(fileName)) {
      const w = document.getText(document.getWordRangeAtPosition(position));
      if (
        new RegExp(
          `"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${w.replace(
            /\//g,
            '\\/'
          )}[\\s\\S]*?\\}`,
          'gm'
        ).test(text)
      ) {
        word = w;
      }
    }
    console.log(line.text);
    // es6: import xxx from 'xxx' or import 'xxxx'
    if (!word) {
      const es6Regx = /import.+from\s+['|"'](.+)['|"']/;
      if (es6Regx.test(line.text)) {
        const match: RegExpMatchArray | null = line.text.match(es6Regx);
        if (match !== null) {
          word = match[1];
        }
      }
    }
    if (!word) {
      const es6Regx = /import\s+['|"'](.+)['|"']/;
      if (es6Regx.test(line.text)) {
        const match: RegExpMatchArray | null = line.text.match(es6Regx);
        if (match !== null) {
          word = match[1];
        }
      }
    }
    // commonjs: let xxx = require('xxx')
    if (!word) {
      const es6Regx = /.*require\(['|"'](.+)['|"']\)/;
      if (es6Regx.test(line.text)) {
        const match: RegExpMatchArray | null = line.text.match(es6Regx);
        if (match !== null) {
          word = match[1];
        }
      }
    }

    if (!word) {
      return;
    }

    let destPath = `${rootPath}/node_modules/${word.replace(
      /"/g,
      ''
    )}/package.json`;
    if (fs.existsSync(destPath)) {
      return new vscode.Location(
        vscode.Uri.file(destPath),
        new vscode.Position(0, 0)
      );
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerDefinitionProvider(['json', 'vue', 'js'], new NodeModuleDefinitionProvider());
  context.subscriptions.push(disposable);
}

export function deactivate() { }
