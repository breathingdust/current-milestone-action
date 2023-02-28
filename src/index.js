const core = require('@actions/core');
const { Octokit } = require('@octokit/action');
require('@octokit/action');

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const octokit = new Octokit();

const closeKeywords = [
  'close',
  'closes',
  'closed',
  'fix',
  'fixes',
  'fixed',
  'resolve',
  'resolves',
  'resolved',
];

const closeDelimiters = [' #', ': #'];

async function assignMilestone(issueNumber, milestoneNumber) {
  try {
    await octokit.request('PATCH /repos/:owner/:repo/issues/:issue_number', {
      owner,
      repo,
      issue_number: issueNumber,
      milestone: milestoneNumber,
    });
    core.info(`Assigned issue ${issueNumber} to milestone ${milestoneNumber}`);
  } catch (error) {
    core.setFailed(
      `Assigning milestone ${milestoneNumber} for pr '${issueNumber}' failed with error ${error}`,
    );
  }
}

async function main() {
  const pullNumber = core.getInput('pull_number');
  const milestoneNumber = core.getInput('milestone_number');

  let pr = {};
  try {
    pr = await octokit.request('GET /repos/:owner/:repo/pulls/:pull_number', {
      owner,
      repo,
      pull_number: pullNumber,
    });
  } catch (error) {
    core.setFailed(`Getting pr for '${pullNumber}' failed with error ${error}`);
  }

  const matchedIssues = [];

  closeKeywords.forEach((keyword) => {
    closeDelimiters.forEach((delimiter) => {
      const regex = new RegExp(`${keyword}${delimiter}(\\d+)`, 'ig');
      let match;

      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(pr.data.body)) !== null) {
        matchedIssues.push(match[1]);
      }
    });
  });

  core.info(`Found ${matchedIssues.length} matched issues.`);

  const results = [];
  results.push(assignMilestone(pullNumber, milestoneNumber));
  for (let index = 0; index < matchedIssues.length; index += 1) {
    results.push(assignMilestone(matchedIssues[index], milestoneNumber));
  }

  await Promise.all(results);
}

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}
