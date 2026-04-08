import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import axios, {isAxiosError} from 'axios';

import * as context from './context.js';
import * as installer from './installer.js';

async function validateSubscription(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let repoPrivate: boolean | undefined;

  if (eventPath && fs.existsSync(eventPath)) {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    repoPrivate = eventData?.repository?.private;
  }

  const upstream = 'crazy-max/ghaction-upx';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';

  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');

  if (repoPrivate === false) return;

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body: Record<string, string> = {action: action || ''};
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      {timeout: 3000}
    );
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error('\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m');
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

async function run(): Promise<void> {
  try {
    await validateSubscription();
    if (os.platform() == 'darwin') {
      core.setFailed('Not supported on darwin platform');
      return;
    }

    const inputs: context.Inputs = await context.getInputs();
    const upx = await installer.getUPX(inputs.version);

    if (inputs.installOnly) {
      const dir = path.dirname(upx);
      core.addPath(dir);
      core.debug(`Added ${dir} to PATH`);
      return;
    }

    const files: string[] = context.resolvePaths(inputs.files);
    if (files.length == 0) {
      core.warning(`No files were found. Please check the 'files' input.`);
      return;
    }

    await context.asyncForEach(files, async filepath => {
      core.startGroup(`Compressing ${filepath}...`);
      await exec.exec(`${upx} ${inputs.args} ${filepath}`);
      core.endGroup();
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
