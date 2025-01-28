# Fortune Cookies for Jira
_Add a spark of inspiration and fun to your Jira projects with the Fortune Cookie app!
Harness OpenAI to generate project-specific prophecies based on lightweight, non-sensitive metrics (e.g. issue counts).
Whether you're refining your backlog or managing your board, open a fortune cookie for a unique blend of motivation and insight._

## Links
- https://developer.atlassian.com/console/myapps
- https://platform.openai.com
- https://www.svgrepo.com
- Legal
  - https://bonterms.com/atlassian/
  - https://app.termly.io

## Notes
- Deploy with `forge deploy`
- Install with `forge install`
  - Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
  - Use `--upgrade` flag for manifest updates
- See https://developer.atlassian.com/platform/marketplace/listing-forge-apps/#testing-your-app-with-different-license-states
  - `forge variables set -e <environment> LICENSE_OVERRIDE <active|inactive>`
  - `forge install --environment <development|staging> --license <active|inactive>`
- Use `forge variables set --encrypt OPEN_API_KEY <key>` to deploy open ai access key
- Use `forge variables list -e <development|staging|production>` to list env

