import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';
import Debug from 'debug';

const debug = Debug('page-loader');
const debugHttp = debug.extend('http:');
const debugFs = debug.extend('filesystem:');
const debugInfo = debug.extend('info:');
const debug$ = debug.extend('$:');

const getPathName = (address) => {
  debugFs('create new filepath for %s', address);
  const { hostname, pathname } = url.parse(address);
  const filename = hostname ? path.join(hostname, pathname) : _.trim(pathname, '/');
  const { dir, name, ext } = path.parse(filename);
  const newFilename = path.join(dir, name).replace(/\W+/g, '-');
  const newPathName = path.format({ name: newFilename, ext });
  return newPathName;
};

const tagTypes = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const processResources = (data, host) => new Promise((resolve) => {
  debugInfo('begin to process resources');
  const { pathname: currentPage } = url.parse(host);
  const $ = cheerio.load(data);
  debug$('load page as DOM');
  const localLinks = [];
  const resourcesFolderPath = `${getPathName(host)}_files`;
  debugFs('create resources folder');
  _.keys(tagTypes).forEach((tag) => {
    const attribute = tagTypes[tag];
    $(`${tag}:not([${attribute}^='http']):not([${attribute}^='#'])`)
      .each(function process() {
        debug$('look for', tag, 'with attribute', attribute);
        const urlPath = $(this).attr(attribute);
        if (urlPath && urlPath === currentPage) {
          debug$('change current page references');
          $(this).attr(attribute, host);
        } else if (urlPath) {
          const localPath = getPathName(urlPath);
          localLinks.push({ urlPath, localPath });
          debug$('switch URI path to localPath');
          $(this).attr(attribute, path.join(resourcesFolderPath, localPath));
        }
      });
  });
  debugInfo('gathered collection of resources in size of %d', localLinks.length);
  const processedHtml = $.html();
  resolve([processedHtml, localLinks]);
});

const download = (host, link, folderPath) => new Promise((resolve) => {
  const { urlPath, localPath } = link;
  const address = url.resolve(host, urlPath);
  debugHttp('GET %s', address);
  const localPathWithFolder = path.resolve(folderPath, localPath);
  const requestConf = {
    method: 'get',
    url: address,
    responseType: 'arraybuffer',
  };
  const promise = axios(requestConf)
    .then(response => fs.writeFile(localPathWithFolder, response.data))
    .then(() => debugFs('save', address, 'to local machine'));
  resolve(promise);
});


const saveResourcesLocally = (resources, host, output) => new Promise((resolve) => {
  debugInfo('begin to save resources to the local machine');
  const pathName = getPathName(host);
  const localPath = path.join(output, pathName);
  const htmlPath = `${localPath}.html`;
  const resourcesPath = `${localPath}_files`;
  debugFs('create paths for page and resources');
  const [processedHtml, localLinks] = resources;
  const promise = fs.writeFile(htmlPath, processedHtml)
    .then(() => debugFs('write page to file'))
    .then(() => fs.mkdir(resourcesPath))
    .then(() => debugFs('create directory for resources'))
    .then(() => debugInfo('begin to load resources'))
    .then(() => Promise.all(localLinks.map(link => download(host, link, resourcesPath))));
  resolve(promise);
});


export default (host, output) => {
  debugInfo('utility starts');
  debugHttp('GET %s', host);
  return axios
    .get(host)
    .then(({ data }) => processResources(data, host))
    .then(resources => saveResourcesLocally(resources, host, output))
    .then(() => debugInfo('successfully exit utility'));
};
