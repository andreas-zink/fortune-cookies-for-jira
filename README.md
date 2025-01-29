# Fortune Cookies for Jira
>Add a spark of inspiration and fun to your Jira projects with the Fortune Cookie app!
Harness OpenAI to generate project-specific prophecies based on lightweight, non-sensitive metrics (e.g. issue counts).
Whether you're refining your backlog or managing your board, open a fortune cookie for a unique blend of motivation and
insight.

## Installation
Please find and install in [Atlassian Marketplace as "Fortune Cookies for Jira"](https://marketplace.atlassian.com/apps/1236690)

## Usage
- Open the Backlog or Board menu
- Select "Open fortune cookie" menu item
- A modal dialog opens with your project prophecy
- Click "Next" for a new prophecy

## Development

### Links
- https://marketplace.atlassian.com/manage/apps/1236690
- https://developer.atlassian.com/console/myapps
- https://developer.atlassian.com/platform/forge/cli-reference/
- https://platform.openai.com
- https://www.svgrepo.com
- Legal
    - https://bonterms.com/atlassian/
    - https://app.termly.io

## Deployment
- Use `forge variables set --encrypt OPEN_API_KEY <key>` to set OpenAI api key
- Use `forge deploy` & `forge install`
