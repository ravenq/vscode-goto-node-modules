const vscode = require('vscode')
const fs = require('fs')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  function provideDefinition(document, position) {
    const fileName = document.fileName
    const rootPath = vscode.workspace.rootPath

    const text = document.getText()
    const line = document.lineAt(position)
    let word
    // packages.json
    if (/package\.json$/.test(fileName)) {
      const w = document.getText(document.getWordRangeAtPosition(position))
      if (
        new RegExp(
          `"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${w.replace(
            /\//g,
            '\\/'
          )}[\\s\\S]*?\\}`,
          'gm'
        ).test(text)
      ) {
        word = w
      }
    }
    console.log(line.text)
    // es6: import xxx from 'xxx' or import 'xxxx'
    if (!word) {
      const es6Regx = /import.+from\s+['|"'](.+)['|"']/
      if (es6Regx.test(line.text)) {
        word = line.text.match(es6Regx)[1]
      }
    }
    if (!word) {
      const es6Regx = /import\s+['|"'](.+)['|"']/
      if (es6Regx.test(line.text)) {
        word = line.text.match(es6Regx)[1]
      }
    }
    // commonjs: let xxx = require('xxx')
    if (!word) {
      const es6Regx = /.*require\(['|"'](.+)['|"']\)/
      if (es6Regx.test(line.text)) {
        word = line.text.match(es6Regx)[1]
      }
    }

    if (!word) {
      return
    }

    let destPath = `${rootPath}/node_modules/${word.replace(
      /"/g,
      ''
    )}/package.json`
    if (fs.existsSync(destPath)) {
      return new vscode.Location(
        vscode.Uri.file(destPath),
        new vscode.Position(0, 0)
      )
    }
  }
  let disposable = vscode.languages.registerDefinitionProvider(
    ['json', 'vue', 'js'],
    {
      provideDefinition
    }
  )
  context.subscriptions.push(disposable)
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
