import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import _ from 'lodash';
import axios from 'axios';

export const getPathName = (address) => {
  const { hostname, pathname } = url.parse(address);
  const filename = hostname
    ? _.trim(path.join(hostname, pathname), '/').replace(/[^A-Za-z0-9_]/gi, '-')
    : _.trim(pathname, '/').replace(/([^A-Za-z0-9.])/gi, '-'); // (?=.*\.) -  all except last dot (for ext)
  return filename;
};

// const generateName = (pathName, end, template = /[^\w]|[_]/gi) => {
//   const { dir, name, ext } = path.parse(_.trim(pathName, '/'));
//   const trimmedPathName = path.join(dir, name);
//   const extention = end || ext || '';
//   return `${trimmedPathName.replace(template, '-')}${extention}`;
// };

export const normalize = (host) => {
  const newUrl = url.parse(host);
  return newUrl.protocol ? host : `https://${host}`;
};

export const getInputData = (address, output) => {
  const pathName = getPathName(address);
  const localPathName = path.join(output, pathName);
  const htmlPath = `${localPathName}.html`;
  const resourcesPath = `${localPathName}_files`;
  const relativeDirPath = `./${pathName}_files`;
  return { htmlPath, resourcesPath, relativeDirPath };
};

export const download = (address) => {
  const requestConf = {
    method: 'get',
    url: address,
    responseType: 'arraybuffer',
  };
  return axios(requestConf);
};

export const save = (responseData, localPath, dir = '') => {
  const localPathWithFolder = path.resolve(dir, localPath);
  return fs.writeFile(localPathWithFolder, responseData);
};
