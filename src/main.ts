import * as core from '@actions/core';
import {community} from './community';

export async function run(): Promise<void> {
  try {
    community();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
