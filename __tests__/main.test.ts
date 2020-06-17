import nock from 'nock';
import * as process from 'process';
import * as path from 'path';

import * as issue from './issue.json';
import * as comments from './comments.json';

process.env['INPUT_TOKEN'] = 'TOKEN';
process.env['GITHUB_REPOSITORY'] = 'github/c2c-packages';
process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, 'payload.json');

import {community, bodies, query} from '../src/community';

test('get all community topics', async () => {
  const github = require('@actions/github');

  nock.disableNetConnect();
  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345')
    .reply(200, issue);

  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345/comments')
    .reply(200, comments.data);

  const b = await query();
  expect(b.length).toBe(3);
  expect(b).toMatchObject([
    ['123', 'third-support-issue'],
    ['1', 'first-support-issue'],
    ['12', 'second-support-issue']
  ]);
});

test('get all the bodies', async () => {
  const github = require('@actions/github');

  nock.disableNetConnect();
  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345')
    .reply(200, issue);

  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345/comments')
    .reply(200, comments.data);
  const b = await bodies(new github.GitHub('TOKEN'));
  expect(b.length).toBe(6);
});

test('run main', async () => {
  nock.disableNetConnect();
  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345')
    .reply(200, issue);

  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345/comments')
    .reply(200, comments.data);
  await community();
});
