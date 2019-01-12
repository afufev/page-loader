import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';

import {
  getPathName, getInputData, download, save,
} from './utils';

const debugHttp = debug('page-loader:http:');
const debugFs = debug('page-loader:fs:');
const debug$ = debug('page-loader:$:');
// const debugStatus = debug('page-loader:status:');

const tagTypes = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const processResources = (data, host, relativeDirPath) => {
  const { pathname: currentPage } = url.parse(host);
  const $ = cheerio.load(data);
  debug$('load page %s as DOM', host);
  const localLinks = [];
  _.keys(tagTypes).forEach((tag) => {
    const attribute = tagTypes[tag];
    const query = `${tag}:not([${attribute}^='http']):not([${attribute}^='#'])`;
    $(query).each((i, elem) => {
      debug$('looking for tag: %s with attribute: %s', tag, attribute);
      const urlPath = $(elem).attr(attribute);
      console.log(url.path);
      if (urlPath && urlPath === currentPage) {
        debug$('replace %s with %s', attribute, host);
        $(elem).attr(attribute, host);
      } else if (urlPath) {
        const localPath = getPathName(urlPath);
        debug$('replace URI path: %s with local path: %s', urlPath, localPath);
        $(elem).attr(attribute, path.join(relativeDirPath, localPath));
        localLinks.push({ urlPath, localPath });
      }
    });
  });
  return [$.html(), localLinks];
};

const saveResources = (resources, host, resourcesPath) => {
  const promises = resources.map((link) => {
    const { urlPath, localPath } = link;
    debugHttp('GET %s', urlPath);
    return download(host, urlPath)
      .then(({ data }) => save(data, localPath, resourcesPath))
      .then(() => debugFs('resource %s saved at %s', urlPath, path.join(resourcesPath, localPath)));
  });
  return Promise.all(promises);
};

export default (host, output) => {
  const inputData = getInputData(host, output);
  const { htmlPath, resourcesPath, relativeDirPath } = inputData;
  let resources;
  let html;
  return download(host)
    .then(({ data }) => processResources(data, host, relativeDirPath))
    .then(([processedHtml, localLinks]) => { html = processedHtml; resources = localLinks; })
    .then(() => fs.mkdir(resourcesPath))
    .then(() => debugFs('resources directory created at %s', resourcesPath))
    .then(() => save(html, htmlPath))
    .then(() => debugFs('html page saved at %s', htmlPath))
    .then(() => saveResources(resources, host, resourcesPath))
    .then(() => debugFs('resources saved to %s', resourcesPath));
};
