import {getApproximateIssueCount, getProject} from "./JiraClient";

export async function getProjectMetrics(projectKey) {
    console.log(`Collecting metrics for project ${projectKey}`)
    const project = await getProject(projectKey);
    //console.log(project);
    const projectMetrics = {
        projectKey,
        projectType: project?.projectTypeKey,
        issueTypeMetrics: await getIssueTypeMetrics(projectKey, project),
    };
    console.log(JSON.stringify(projectMetrics, null, 2));
    return projectMetrics;
}

async function getIssueTypeMetrics(projectKey, project) {
    const issueTypes = getIssueTypes(project);
    const promises = issueTypes.map(issueType =>
        getIssueTypeCountByStatus(projectKey, issueType)
    );
    const results = await Promise.all(promises);
    return issueTypes.map((issueType, index) => ({
        ...issueType,
        issueCountByStatus: results[index]
    }));
}

function getIssueTypes(project) {
    return project?.issueTypes
        ?.filter(issueType => issueType.hierarchyLevel === 0)
        ?.map(issueType => {
            return {
                issueTypeName: issueType.name,
                issueTypeDescription: issueType.description,
            }
        });
}

async function getIssueTypeCountByStatus(projectKey, issueType) {
    // statusCategory => "To Do"=2, "In Progress"=3, "Done"=4
    const [open, inProgress, done] = await Promise.all([
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.issueTypeName} AND statusCategory=2 AND updated >= -14d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.issueTypeName} AND statusCategory=3 AND updated >= -14d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.issueTypeName} AND statusCategory=4 AND resolved >= -14d`),
    ]);
    return {
        open,
        inProgress,
        done,
    };
}