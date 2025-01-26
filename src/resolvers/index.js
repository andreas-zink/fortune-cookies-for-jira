import Resolver from '@forge/resolver';
import api, {fetch, route, storage} from '@forge/api';

const prophecyLimit = 100;
const limitReachedProphecy = `"Today's fortune has been fulfilled — your daily limit has been reached. Remember, patience is a virtue, and tomorrow brings new opportunities."`
const resolver = new Resolver();

resolver.define('getProphecy', async (request) => {
    // console.log(request);
    const locale = getLocaleFromRequest(request);
    const projectKey = getProjectKeyFromRequest(request);
    const prophecyContext = await getProphecyContext(projectKey);
    if (!prophecyContext?.prophecy) {
        return await doGenerateProphecy(projectKey, locale);
    }
    return prophecyContext?.prophecy;
});

resolver.define('generateProphecy', async (request) => {
    // console.log(request);
    const locale = getLocaleFromRequest(request);
    const projectKey = getProjectKeyFromRequest(request);
    return doGenerateProphecy(projectKey, locale);
});

function getProjectKeyFromRequest(request) {
    return request?.context?.extension?.project?.key;
}
function getLocaleFromRequest(request) {
    return request?.payload?.locale ?? 'en-US';
}

function getProphecyContext(projectKey) {
    return storage.get(getProphecyStoragekey(projectKey));
}

function setProphecyContext(projectKey, prophecyContext) {
    return storage.set(getProphecyStoragekey(projectKey), prophecyContext);
}

function getProphecyStoragekey(projectKey) {
    return `${projectKey}-prophecy`;
}

async function doGenerateProphecy(projectKey, locale) {
    const prophecyContext = await getProphecyContext(projectKey) ?? {
        prophecy: null,
        locale: locale,
        timestamp: getLocalDateEpochMillis(),
        counter: 0
    }
    resetCounterOnNextDay(prophecyContext);

    if (hasNotReachedProphecyLimit(prophecyContext)) {
        prophecyContext.prophecy = await collectProjectMetrics(projectKey)
            .then(projectMetrics => requestProphecy(projectMetrics, locale));
        prophecyContext.counter++
    } else {
        prophecyContext.prophecy = limitReachedProphecy;
    }
    await setProphecyContext(projectKey, prophecyContext);
    return prophecyContext.prophecy;
}

function resetCounterOnNextDay(prophecyContext) {
    const today = getLocalDateEpochMillis();
    if (prophecyContext.timestamp < today) {
        prophecyContext.timestamp = today;
        prophecyContext.counter = 0;
    }
}

function hasNotReachedProphecyLimit(prophecyContext) {
    return prophecyContext.counter < prophecyLimit;
}

function getLocalDateEpochMillis(){
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}


async function collectProjectMetrics(projectKey) {
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

async function getProject(projectKey){
    return await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => response.json());
}

async function getApproximateIssueCount(jql){
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

async function getIssueMetrics(projectKey, issueTypes){
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

async function getIssueTypeMetrics(projectKey, issueType) {
    // project = {project.key}
    // issuetype = {types}
    // statusCategory = "To Do"=2, "In Progress"=3, "Done"=4
    // created >= -30d
    const [open, inProgress, done] = await Promise.all([
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=2 AND updated >= -7d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=3 AND updated >= -7d`),
        getApproximateIssueCount(`project=${projectKey} AND issuetype = ${issueType.name} AND statusCategory=4 AND resolved >= -7d`),
    ]);
    return {
        open,
        inProgress,
        done,
    };
}

async function requestProphecy(projectMetrics, locale){
    console.log(`Requesting prophecy for project ${projectMetrics.projectKey}`);
    projectMetrics.locale = locale;
    const body = {
        model: 'gpt-4o-mini',
        messages: [
            {
                "role": "developer",
                "content": `Write a fortune cookie prophecy for a Jira project and consider the following rules:
                    - Approximately 10 words but max 20 words.
                    - Answer in the given locale
                    - Use the given project type as context for wording, humor, topics, etc. For example project type 'software' should result in stereotypical wording for software developers.
                    - You can, but don't have to, use the given issue metrics. They contain the project's type of issues with name and description. They also contain the amount of issues by state 'open', 'in progress' and 'done'. For example, having many bugs can lead to a dark prophecy.`
            },
            {
                "role": "user",
                "content": `${JSON.stringify(projectMetrics)}`
            }
        ]
    };

    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getOpenAPIKey()}`,
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(body)
    };

    const response = await fetch(`https://api.openai.com/v1/chat/completions`, options);
    let result = ''

    if (response.status === 200) {
        const chatCompletion = await response.json();
        const firstChoice = chatCompletion.choices[0]

        if (firstChoice) {
            result = firstChoice.message.content;
        } else {
            console.warn(`Chat completion response did not include any assistance choices.`);
            result = `AI response did not include any choices.`;
        }
    } else {
        const text = await response.text();
        result = text;
    }

    return result;
}

function getOpenAPIKey()  {
    return process.env.OPEN_API_KEY;
}

export const handler = resolver.getDefinitions();
