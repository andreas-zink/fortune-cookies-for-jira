import {getApproximateIssueCount, getProject} from "./JiraClient";
import {storage} from "@forge/api";

export async function loadProjectMetrics(projectKey) {
    try {
        let projectMetrics = await storage.get(getStorageKey(projectKey));
        if (!projectMetrics || isOutdated(projectMetrics)) {
            projectMetrics = await buildProjectMetrics(projectKey);
            await storage.set(getStorageKey(projectKey), projectMetrics);
        }
        return projectMetrics;
    } catch (e) {
        console.error(`Failed to load project metrics for ${projectKey}: ${e}`);
    }
}

function isOutdated(projectMetrics) {
    return projectMetrics?.timestamp < getLocalHourEpochMillis();
}

async function buildProjectMetrics(projectKey) {
    console.log(`Collecting metrics for project ${projectKey}`)
    const project = await getProject(projectKey);
    const projectMetrics = {
        projectKey,
        projectType: project?.projectTypeKey,
        timestamp: getLocalHourEpochMillis(),
        issueTypeMetrics: await getIssueTypeMetrics(projectKey, project),
    };
    console.log(`Collected project metrics: ${JSON.stringify(projectMetrics, null, 2)}`);
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

function getLocalHourEpochMillis() {
    let date = new Date();
    date.setMinutes(0, 0, 0);
    return date.getTime();
}

function getStorageKey(projectKey) {
    return `${projectKey}-metrics`;
}