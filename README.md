# Current Milestone Action

Given a target Pull Request and Milestone, this action will assign that PR and any linked issues which the PR closes to the milestone.

Inputs:

- GITHUB_TOKEN: The token you wish to use for action to interact with the GitHub API eg. `${{ secrets.GITHUB_TOKEN }}`
- pull_number: The target pull request number (id). eg. `${{ github.event.pull_request.number }}`
- milestone_number: The target milestone number (id).
