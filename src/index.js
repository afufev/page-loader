import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import axios from 'axios';

const getDest = (address, output) => {
  const { hostname, pathname } = url.parse(address);
  let name;
  if (pathname === '/') {
    name = hostname;
  } else {
    name = `${hostname}${pathname}`;
  }
  const filename = name.replace(/\W+/g, '-').concat('.html');
  return path.resolve(output, filename);
};

export default (address, output) => {
  const dest = getDest(address, output);
  return axios
    .get(address)
    .then(({ data }) => fs.writeFile(dest, data))
    .catch(e => Promise.reject(e));
};
