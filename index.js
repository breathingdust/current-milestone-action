const core = require('@actions/core');
const { Octokit } = require('@octokit/action');
require("@octokit/action");

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const octokit = new Octokit();

const closeKeywords = [
  "close",
  "closes",
  "closed",
  "fix",
  "fixes",
  "fixed",
  "resolve",
  "resolves",
  "resolved",
];

const closeDelimiters = [
  " #",
  ": #",
];

async function main() {
  const pull_number = core.getInput('pull_number');
  const milestone_number = core.getInput('milestone_number');

  let pr = {};
  try {
    pr = await octokit.request("GET /repos/:owner/:repo/pulls/:pull_number", {
      owner,
      repo,
      pull_number,
    });
  } catch (error) {
    core.setFailed(`Getting pr for '${pull_number}' failed with error ${error}`);
  }  

  let matchedIssues = [];

  closeKeywords.forEach(function(keyword) {
    closeDelimiters.forEach(function(delimiter) {
      let regex = new RegExp(`${keyword}${delimiter}(\\d+)`, "ig");
      let matches = regex.exec(pr.data.body);
      if (matches) {
        matchedIssues.push(matches[1]);
      }
    });
  });

  core.info(`Found ${matchedIssues.length} matched issues.`);

  for (const issue_number of matchedIssues) {
    await assignMilestone(issue_number, milestone_number);
  }

  await assignMilestone(pull_number, milestone_number);
}

async function assignMilestone(issue_number,  milestone_number) {
  try {
    await octokit.request("PATCH /repos/:owner/:repo/issues/:issue_number", {
      owner,
      repo,
      issue_number,
      milestone: milestone_number
    });
    core.info(`Assigned issue ${issue_number} to milestone ${milestone_number}`);
  } catch (error) {
    core.setFailed(`Assigning milestone ${milestone_number} for pr '${issue_number}' failed with error ${error}`);
  } 
}

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}
