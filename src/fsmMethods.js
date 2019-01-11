import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';

import { getPathName, download, save } from './utils';

const debugHttp = debug('page-loader:http:');
const debugFs = debug('page-loader:fs:');
const debug$ = debug('page-loader:$:');

const tagTypes = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export const processResources = (data, host, relativeDirPath) => new Promise((resolve) => {
  const { pathname: currentPage } = url.parse(host);
  const $ = cheerio.load(data);
  debug$('load page %s as DOM', host);
  const localLinks = _.keys(tagTypes).reduce((acc, tag) => {
    const linkPaths = [];
    const attribute = tagTypes[tag];
    const query = `${tag}:not([${attribute}^='http']):not([${attribute}^='#'])`;
    $(query).each(function processTag() {
      debug$('looking for %s with attribute %s', tag, attribute);
      const urlPath = $(this).attr(attribute);
      const localPath = getPathName(urlPath);
      if (urlPath && urlPath === currentPage) {
        debug$('replace %s with %s', attribute, host);
        $(this).attr(attribute, host);
      } else if (urlPath) {
        debug$('replace URI path: %s with local path: %s', urlPath, localPath);
        $(this).attr(attribute, path.join(relativeDirPath, localPath));
        linkPaths.push({ urlPath, localPath });
      }
    });
    return [...acc, ...linkPaths];
  }, []);
  resolve([$.html(), localLinks]);
});

export const saveResources = (resources, host, resourcesPath) => {
  const promises = resources.map((link) => {
    const { urlPath, localPath } = link;
    debugHttp('GET %s', urlPath);
    return download(host, urlPath)
      .then(({ data }) => save(data, localPath, resourcesPath))
      .then(() => debugFs('resource %s saved at %s', urlPath, path.join(resourcesPath, localPath)));
  });
  return Promise.all(promises);
};
