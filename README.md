# Assign pull request and issues to milestone

Given a target PR and Milestone, this action will assign that PR and linked issues to the milestone.

Inputs:

- GITHUB_TOKEN: The token you wish to use for action to interact with the GitHub API eg. `${{ secrets.GITHUB_TOKEN }}`
- pull_number: The target pull request number (id). eg. `${{ github.event.pull_request.number }}`
- milestone_number: The target milestone number (id). 

