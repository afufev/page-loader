import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';


const getPathName = (address) => {
  const { hostname, pathname } = url.parse(address);
  const filename = hostname ? path.join(hostname, pathname) : _.trimEnd(pathname, '/');
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
  const { pathname: currentPage } = url.parse(host);
  const $ = cheerio.load(data);
  const localLinks = [];
  const resourcesFolderPath = `${getPathName(host)}_files`;
  _.keys(tagTypes).forEach((tag) => {
    const attribute = tagTypes[tag];
    $(`${tag}:not([${attribute}^='http']):not([${attribute}^='#'])`)
      .each(function process() {
        const urlPath = $(this).attr(attribute);
        if (urlPath === currentPage) {
          $(this).attr(attribute, host);
        } else {
          const localPath = getPathName(urlPath);
          localLinks.push({ urlPath, localPath });
          $(this).attr(attribute, path.join(resourcesFolderPath, localPath));
        }
      });
  });
  const processedHtml = $.html();
  resolve([processedHtml, localLinks]);
});

const download = (host, link, folderPath) => new Promise((resolve) => {
  const { urlPath, localPath } = link;
  const address = url.resolve(host, urlPath);
  const localPathWithFolder = path.resolve(folderPath, localPath);
  const requestConf = {
    method: 'get',
    url: address,
    responseType: 'arraybuffer',
  };
  const promise = axios(requestConf)
    .then(response => fs.writeFile(localPathWithFolder, response.data));
  resolve(promise);
});


const saveResourcesLocally = (resources, host, output) => new Promise((resolve) => {
  const pathName = getPathName(host);
  const localPath = path.join(output, pathName);
  const htmlPath = `${localPath}.html`;
  const resourcesPath = `${localPath}_files`;
  const [processedHtml, localLinks] = resources;
  const promise = fs.writeFile(htmlPath, processedHtml)
    .then(() => fs.mkdir(resourcesPath))
    .then(() => Promise.all(localLinks.map(link => download(host, link, resourcesPath))));
  resolve(promise);
});


export default (host, output) => axios
  .get(host)
  .then(({ data }) => processResources(data, host))
  .then(resources => saveResourcesLocally(resources, host, output));
