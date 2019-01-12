import { promises as fs } from 'fs';
import debug from 'debug';
import StateMachine from 'javascript-state-machine';

import { getInputData, download, save } from './utils';

import { processResources, saveResources } from './fsmMethods';


const debugFs = debug('page-loader:fs:');
const debugStatus = debug('page-loader:status:');

const fsm = new StateMachine({
  init: 'waitingInput',
  transitions: [
    { name: 'getPage', from: '*', to: 'pageLoaded' },
    { name: 'processResources', from: 'pageLoaded', to: 'resourcesProcessed' },
    { name: 'createResourcesDir', from: 'resourcesProcessed', to: 'directoryCreated' },
    { name: 'savePage', from: 'directoryCreated', to: 'pageSaved' },
    { name: 'saveResources', from: 'pageSaved', to: 'resourcesSaved' },
    { name: 'step', from: 'resourcesSaved', to: 'waitingInput' },
  ],
  methods: {
    // debug-related methods
    onExitState: ({ to }) => debugStatus('state:', to),
    onTransition: ({ transition }) => debugStatus('transition:', transition),
    // fsm methods
    onGetPage: (lc, host) => download(host),
    onProcessResources: (lc, data, host, resPath) => processResources(data, host, resPath),
    onCreateResourcesDir: (lc, resPath) => fs.mkdir(resPath),
    onSavePage: (lc, html, htmlPath) => save(html, htmlPath),
    onSaveResources: (lc, res, host, resourcesPath) => saveResources(res, host, resourcesPath),
  },
});

export default (host, output) => {
  console.log(host);
  const inputData = getInputData(host, output);
  const { htmlPath, resourcesPath, relativeDirPath } = inputData;
  let resources;
  let html;
  return fsm.getPage(host)
    .then(({ data }) => fsm.processResources(data, host, relativeDirPath))
    .then(([processedHtml, localLinks]) => { html = processedHtml; resources = localLinks; })
    .then(() => fsm.createResourcesDir(resourcesPath))
    .then(() => debugFs('resources directory created at %s', resourcesPath))
    .then(() => fsm.savePage(html, htmlPath))
    .then(() => debugFs('html page saved at %s', htmlPath))
    .then(() => fsm.saveResources(resources, host, resourcesPath))
    .then(() => debugFs('resources saved to %s', resourcesPath))
    .then(() => fsm.step());
};
