import os from 'os';
import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

import pageLoader from '../src';

nock.disableNetConnect();

axios.defaults.adapter = httpAdapter;

let output;
let expectedHtml;
let dest;

const fixturesPathExpectedHtml = './__tests__/__fixtures__/test-hexlet-io-courses.html';
const host = 'http://ru.hexlet.io/';
const filename = 'ru-hexlet-io-courses.html';
const testPath = '/courses';
const address = url.resolve(host, testPath);


describe('step1', () => {
  beforeEach(async () => {
    output = await fs.mkdtemp(path.resolve(os.tmpdir(), 'page-loader-'));
    expectedHtml = await fs.readFile(fixturesPathExpectedHtml, 'utf-8');
    dest = path.join(output, filename);
  });
  it('#get', async () => {
    nock(host).get('/courses').reply(200, expectedHtml);
    await pageLoader(address, output);
    const response = await fs.readFile(dest, 'utf-8');
    expect(response).toBe(expectedHtml);
  });
  it('#error', async () => {
    try {
      await pageLoader('unknown', output);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
