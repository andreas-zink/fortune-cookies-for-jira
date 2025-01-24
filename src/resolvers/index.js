import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';

const resolver = new Resolver();

resolver.define('getProphecy', async ({context}) => {
    //console.log(context);
    //console.log(context?.extension?.project);
    const projectMetrics = await collectProjectMetrics(context?.extension?.project?.key);
    return await requestProphecy(projectMetrics);
});

const collectProjectMetrics = async (projectKey) => {
    console.log(`Collecting metrics for project ${projectKey}`)
    const project = await getProject(projectKey);
    //console.log(project);
    const projectType = project?.projectTypeKey;
    const issueTypes = project?.issueTypes
        ?.filter(item => item.hierarchyLevel === 0)
        ?.map(({name, description}) => ({name, description}));
    const issueMetrics = await getIssueMetrics(projectKey, issueTypes);

    const projectMetrics = {
        projectKey,
        projectType,
        issueMetrics,
    };
    console.log(JSON.stringify(projectMetrics, null, 2
    ));
    return projectMetrics;
}

const getProject = async (projectKey) => {
    return await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => response.json());
}

const getApproximateIssueCount = async (jql) => {
    return await api.asApp().requestJira(route`/rest/api/3/search/approximate-count`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{"jql": "${jql}"}`
    })
        .then(response => response.json())
        .then(json => json.count);
}

const getIssueMetrics = async (projectKey, issueTypes) => {
    const promises = issueTypes.map(issueType =>
        getIssueTypeMetrics(projectKey, issueType)
    );
    const results = await Promise.all(promises);
    const mergedResults = issueTypes.map((issueType, index) => ({
        ...issueType,
        metrics: results[index]
    }));
    return mergedResults;
}

const getIssueTypeMetrics = async (projectKey, issueType) => {
    // project = {project.key}
    // issuetype = {types}
    // statusCategory = "To Do"=2, "In Progress"=3, "Done"=4
    // created >= -30d
    const [open, openRecent, inProgress, inProgressRecent, done, doneRecent] = await Promise.all([
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=2 AND created >= -30d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=2 AND created >= -7d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=3 AND updated >= -30d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=3 AND updated >= -7d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=4 AND resolved >= -30d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=4 AND resolved >= -7d`),
    ]);
    return {
        open,
        openRecent,
        openRecentRate: computeRate(openRecent, open),
        inProgress,
        inProgressRecent,
        inProgressRecentRate: computeRate(inProgressRecent, inProgress),
        done,
        doneRecent,
        doneRecentRate: computeRate(doneRecent, done),
    };
}

const computeRate = (countRecent, count) => {
    return count === 0 ? 0 : countRecent / count;
}

const requestProphecy = async (projectMetrics) => {
    console.log(`Requesting prophecy`);
    return "With every open bug ticket lies an opportunity: Fixing them will clear the path to seamless integration.";
}

export const handler = resolver.getDefinitions();
