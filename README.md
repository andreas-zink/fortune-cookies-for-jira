# Fortune Cookie app for Jira
Add a spark of inspiration and fun to your Jira projects with the Fortune Cookie app!
Harness OpenAI to generate project-specific prophecies based on lightweight, non-sensitive metrics (e.g. issue counts).
Whether you're refining your backlog or managing your board, open a fortune cookie for a unique blend of motivation and insight.

##
- https://developer.atlassian.com/console/myapps/dcaf209a-2091-4ab2-9b8c-3a8a95b98d4d/overview
- https://platform.openai.com/settings/proj_vRVuUkkur1LGn6xHoS5wpD5W

## Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
  - Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
  - Use `--upgrade` flag for manifest updates
- See https://developer.atlassian.com/platform/marketplace/listing-forge-apps/#testing-your-app-with-different-license-states
  - `forge install --environment <development|staging> --license <active|inactive>`
- Use `forge variables set --encrypt OPEN_API_KEY <key>` to deploy open ai access key
- Use `forge variables list -e <development|staging|production>` to list env

