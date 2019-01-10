import path from 'path';
import url from 'url';
import _ from 'lodash';

export default (address) => {
  const { hostname, pathname } = url.parse(address);
  const filename = hostname ? path.join(hostname, pathname) : _.trim(pathname, '/');
  const { dir, name, ext } = path.parse(filename);
  const newFilename = path.join(dir, name).replace(/\W+/g, '-');
  const newPathName = path.format({ name: newFilename, ext });
  return newPathName;
};
