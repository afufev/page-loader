import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import _ from 'lodash';
import axios from 'axios';

export const getPathName = (address) => {
  const { hostname, pathname } = url.parse(address);
  const filename = hostname
    ? _.trim(path.join(hostname, pathname), '/').replace(/[^A-Za-z0-9_]/g, '-')
    : _.trim(pathname, '/').replace(/([^A-Za-z0-9])(?=.*\.)/g, '-'); // all except last dot (for ext)
  return filename;
};

// export const normalizeHost = (host) => {
//   const newUrl = url.parse(host);
//   console.log(newUrl);
//   return host;
// };

export const getInputData = (address, output) => {
  const pathName = getPathName(address);
  const localPathName = path.join(output, pathName);
  const htmlPath = `${localPathName}.html`;
  const resourcesPath = `${localPathName}_files`;
  const relativeDirPath = `./${pathName}_files`;
  return { htmlPath, resourcesPath, relativeDirPath };
};

// axios.interceptors.response.use(response => response, (err) => {
//   // retry connection with new protocol
//   const { config } = err;
//   if (!config || !config.url) return Promise.reject(err);
//   // Set the variable for keeping track of the retry count
//   config.retryCount = config.retryCount || 0;
//   // Check if we've maxed out the total number of retries
//   if (config.retryCount >= config.retry) {
//     // Reject with the error
//     return Promise.reject(err);
//   }
//   // Increase the retry count
//   config.retryCount += 1;
//   // Create new promise to handle exponential backoff
//   const backoff = new Promise(resolve => setTimeout(resolve, 0));
//   // Set protocol to config
//   const u = url.parse(config.url);
//   console.log(u);
//   const protocol = u.protocol ? config.changeProtocol[u.protocol] : 'https:';
//   config.url = `${protocol}//${u.href}`;
//   // Return the promise in which recalls axios to retry the request
//   console.log(url.parse(config.url));
//   console.log(config);
//   return backoff.then(() => axios(config));
// });


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
