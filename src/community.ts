import * as core from '@actions/core';
import * as github from '@actions/github';
import {type} from 'os';

// https://github.community/t/bug-nuget-support-build-metadata-properly/117606
export const COMMUNITY_TOPIC_REGEX = /github\.community\/t\/(.+)\/(\d+)/g;

export async function community(): Promise<void> {
  try {
    const context = github.context;
    const topics = await query();
    console.log('TOPICS', topics);

    core.setOutput('topics', JSON.stringify(topics));
    // https://github.community/t/getting-object-length/17802/3
    core.setOutput('length', `${topics.length}`);
    core.setOutput('issue', `${context.issue.number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function query(): Promise<Array<[string, string]>> {
  const token = core.getInput('token', {required: true});

  const octokit: github.GitHub = new github.GitHub(token);
  const context = github.context;
  let topics = await bodies(octokit);

  const set = new Map();
  topics.forEach((issue: any) => {
    const urls = [...issue.matchAll(COMMUNITY_TOPIC_REGEX)];
    urls.forEach((m: any) => {
      set.set(m[2], m[1]);
    });
  });
  return [...set];
}

export async function bodies(octokit: github.GitHub): Promise<Array<string>> {
  const context = github.context;

  const issue: Array<string> = await octokit.issues
    .get({
      ...context.repo,
      issue_number: context.issue.number
    })
    .then(result => [result.data.title, result.data.body]);

  const comments: Array<string> = await octokit.issues
    .listComments({
      ...context.repo,
      issue_number: context.issue.number
    })
    .then(result => result.data.map(i => i.body));

  return comments.concat(issue);
}
