import errno from 'errno';
import _ from 'lodash';

const errorMessages = [
  {
    check: error => !!error.path,
    getMessage: error => `Error: ${error.message}`,
  },
  {
    check: error => !!error.host,
    getMessage: error => `Error: ${error.code}: recieved status ${error.port} connecting to ${error.host}`,
  },
  {
    check: error => !!error.response,
    getMessage: error => `Error: ${errno.errno[6].code}: recieved status ${error.response.status} - ${error.response.statusText}: ${errno.errno[6].description}`,
  },
  {
    check: error => !!error,
    getMessage: (error) => {
      const libErrno = errno.errno[error.errno];
      return libErrno ? `Error: ${libErrno.code}: ${libErrno.description}` : 'Unknown error, please, send us report';
    },
  },
];

const getNewMessage = (error) => {
  const findMessage = _.find(errorMessages, ({ check }) => check(error));
  const message = findMessage.getMessage(error);
  return `Unable to download the page. ${message}`;
};

export default class extends Error {
  constructor(error) {
    super();
    this.message = getNewMessage(error);
    this.name = error.name;
    this.code = error.code;
    this.errno = error.errno;
  }
}
