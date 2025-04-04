import {
  BottomBarPanel,
  EditorView,
  MarkerType,
  ProblemsView,
  TextEditor,
  VSBrowser,
} from 'vscode-extension-tester';
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';

describe('Dockerfile', function () {
  let bottomBar: BottomBarPanel;

  before(async function () {
    bottomBar = new BottomBarPanel();
    await bottomBar.toggle(true);
  });

  after(async function () {
    await bottomBar.toggle(false);
  });

  describe('Problems', function () {
    let editorView: EditorView;
    let view: ProblemsView;

    async function problemsExist(view: ProblemsView) {
      const markers = await view.getAllVisibleMarkers(MarkerType.Any);
      return markers.length > 0;
    }

    before(async function () {
      this.timeout(30000);

      editorView = new EditorView();
      view = await bottomBar.openProblemsView();

      const dockerfilePath = path.join('test', 'resources', 'Dockerfile');
      fs.writeFileSync(dockerfilePath, 'FROM scratch\nENTRYPOINT ""\n');

      await VSBrowser.instance.openResources(dockerfilePath);

      await view.getDriver().wait(async function () {
        return await problemsExist(view);
      }, 15000);
    });

    after(async function () {
      await editorView.closeAllEditors();

      const dockerfilePath = path.join('test', 'resources', 'Dockerfile');
      fs.writeFileSync(dockerfilePath, '');
    });

    it('Dockerfile has no errors', async function () {
      const errors = await view.getAllVisibleMarkers(MarkerType.Error);
      expect(errors).is.empty;
    });

    it('Dockerfile has a JSONArgsRecommended warning', async function () {
      const warnings = await view.getAllVisibleMarkers(MarkerType.Warning);
      expect(warnings.length).equals(1);

      const warningText = await warnings[0].getText();
      expect(warningText).equal(
        'Warning: JSON arguments recommended for ENTRYPOINT/CMD to prevent unintended behavior related to OS signals (JSON arguments recommended for ENTRYPOINT to prevent unintended behavior related to OS signals) at line 2 and character 1. generated by docker-language-server',
      );
    });

    it('Dockerfile modified with a FromAsCasing warning', async function () {
      this.timeout(30000);

      const editor = (await editorView.openEditor('Dockerfile')) as TextEditor;
      await editor.clearText();
      await editor.setText('FROM scratch\n');
      await editor.typeTextAt(2, 1, 'FROM scratch as base');

      await view.getDriver().wait(async function () {
        return await problemsExist(view);
      }, 15000);

      const warnings = await view.getAllVisibleMarkers(MarkerType.Warning);
      expect(warnings.length).equals(1);

      const warningText = await warnings[0].getText();
      expect(warningText).equal(
        "Warning: The 'as' keyword should match the case of the 'from' keyword ('as' and 'FROM' keywords' casing do not match) at line 2 and character 1. generated by docker-language-server",
      );

      await editor.save();
    });
  });
});
