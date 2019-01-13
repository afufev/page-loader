import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import _ from 'lodash';
import axios from 'axios';

export const getPathName = (address) => {
  const { hostname, pathname } = url.parse(address);
  const filename = hostname ? path.join(hostname, pathname) : _.trim(pathname, '/'); // path.join throws error on null
  const { dir, name, ext } = path.parse(filename);
  const newFilename = path.join(dir, name).replace(/\W+/g, '-');
  const newPathName = path.format({ name: newFilename, ext });
  return newPathName;
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
