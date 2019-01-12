import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';
import ProjectError from './ProjectError';

import {
  getPathName, getInputData, download, save,
} from './utils';

const debugHttp = debug('page-loader:http:');
const debugFs = debug('page-loader:fs:');
const debug$ = debug('page-loader:$:');

const tagTypes = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const findLinks = (data, host, currentPage) => {
  const $ = cheerio.load(data);
  debug$('load page %s as DOM', host);
  const links = [];
  _.keys(tagTypes).forEach((tag) => {
    const attribute = tagTypes[tag];
    $(`${tag}[${attribute}]`).not(`[${attribute}^='http']`).not(`[${attribute}^='#']`)
      .each((i, elem) => {
        debug$('looking for tag: %s with attribute: %s', tag, attribute);
        const urlPath = $(elem).attr(attribute);
        const localPath = (urlPath === currentPage) ? host : getPathName(urlPath);
        links.push({ tag, urlPath, localPath });
      });
  });
  return [$, links];
};

const processResources = (data, host, relativeDirPath) => {
  const { pathname: currentPage } = url.parse(host);
  const [$, links] = findLinks(data, host, currentPage);
  const localLinks = links.reduce((acc, link) => {
    const { tag, urlPath, localPath } = link;
    const attribute = tagTypes[tag];
    if (urlPath === currentPage) {
      debug$('replace %s with %s', attribute, host);
      $(`${tag}[${attribute}^='${urlPath}']`).attr(attribute, host);
      return acc;
    }
    debug$('replace URI path: %s with local path: %s', urlPath, localPath);
    $(`${tag}[${attribute}^='${urlPath}']`).attr(attribute, path.join(relativeDirPath, localPath));
    return [...acc, { urlPath, localPath }];
  }, []);
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
    .then(() => debugFs('resources saved to %s', resourcesPath))
    .catch(error => throw new ProjectError(error));
};
