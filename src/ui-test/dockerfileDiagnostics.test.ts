import {
  BottomBarPanel,
  EditorView,
  MarkerType,
  ProblemsView,
  VSBrowser,
} from 'vscode-extension-tester';
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
    let view: ProblemsView;

    async function problemsExist(view: ProblemsView) {
      const markers = await view.getAllVisibleMarkers(MarkerType.Any);
      return markers.length > 0;
    }

    before(async function () {
      this.timeout(30000);

      view = await bottomBar.openProblemsView();

      await VSBrowser.instance.openResources(
        path.join('test', 'resources', 'Dockerfile'),
      );

      await view.getDriver().wait(async function () {
        return await problemsExist(view);
      }, 15000);
    });

    after(async function () {
      await new EditorView().closeAllEditors();
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
  });
});
