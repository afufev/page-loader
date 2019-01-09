import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import axios from 'axios';

const getDest = (address, output) => {
  const { hostname, pathname } = url.parse(address);
  const filename = path
    .join(hostname, pathname)
    .replace(/\W+/g, '-')
    .concat('.html');
  return path.resolve(output, filename);
};

export default (address, output) => {
  const dest = getDest(address, output);
  return axios
    .get(address)
    .then(({ data }) => fs.writeFile(dest, data));
};


// const getTitle = body => body.match(/<h1>(.*?)<\/h1>/)[1];
// const getLinks = body => (body.match(/href="\/(.*?)">/g) || [])
//   .map(item => item.match(/href="\/(.*?)">/)[1]);
