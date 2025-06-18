import * as vscode from 'vscode';
import { DockerfileParser } from 'dockerfile-ast';

/**
 * Decoration that inserts a horizontal line into the editor.
 */
const decoration = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  borderWidth: '1px 0 0 0',
  borderStyle: 'solid',
  borderColor: new vscode.ThemeColor('panelTitle.activeBorder'),
});

function getDecorationRanges(document: vscode.TextDocument): vscode.Range[] {
  if (document.languageId === 'dockerfile' && document.uri.scheme === 'file') {
    const dockerfile = DockerfileParser.parse(document.getText());
    return dockerfile.getFROMs().map((from) => {
      const line = from.getRange().start.line;
      return new vscode.Range(line, 0, line, 0);
    });
  }
  return [];
}

export function hookDecorators(ctx: vscode.ExtensionContext): void {
  vscode.window.visibleTextEditors.forEach((editor) =>
    editor.setDecorations(decoration, getDecorationRanges(editor.document)),
  );

  vscode.window.onDidChangeVisibleTextEditors(
    (editors) => {
      for (const editor of editors) {
        editor.setDecorations(decoration, getDecorationRanges(editor.document));
      }
    },
    null,
    ctx.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      for (const editor of vscode.window.visibleTextEditors) {
        if (
          event.document.uri.scheme === editor.document.uri.scheme &&
          event.document.uri.path === editor.document.uri.path
        ) {
          editor.setDecorations(
            decoration,
            getDecorationRanges(editor.document),
          );
        }
      }
    },
    null,
    ctx.subscriptions,
  );
}
