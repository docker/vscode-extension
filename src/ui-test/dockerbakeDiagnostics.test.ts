import {
  BottomBarPanel,
  EditorView,
  MarkerType,
  ProblemsView,
  VSBrowser,
} from 'vscode-extension-tester';
import * as path from 'path';
import { expect } from 'chai';

describe('Docker Bake', function () {
  let bottomBar: BottomBarPanel;

  before(async function () {
    bottomBar = new BottomBarPanel();
    await bottomBar.toggle(true);
  });

  after(async function () {
    await bottomBar.toggle(false);
  });

  describe('Problems', function () {
    let view: ProblemsView;

    async function problemsExist(view: ProblemsView) {
      const markers = await view.getAllVisibleMarkers(MarkerType.Any);
      return markers.length > 0;
    }

    before(async function () {
      this.timeout(30000);

      view = await bottomBar.openProblemsView();

      await VSBrowser.instance.openResources(
        path.join('test', 'resources', 'docker-bake.hcl'),
      );

      await view.getDriver().wait(async function () {
        return await problemsExist(view);
      }, 15000);
    });

    after(async function () {
      await new EditorView().closeAllEditors();
    });

    it('Bake file has an error about not being able to find an ARG', async function () {
      const errors = await view.getAllVisibleMarkers(MarkerType.Error);
      expect(errors.length).equals(1);

      const errorText = await errors[0].getText();
      expect(errorText).equal(
        "Error: 'var' not defined as an ARG in your Dockerfile at line 3 and character 9. generated by Docker DX (docker-language-server)",
      );
    });

    it('Bake file has no warnings', async function () {
      const warnings = await view.getAllVisibleMarkers(MarkerType.Warning);
      expect(warnings).is.empty;
    });
  });
});
