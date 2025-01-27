import api, {route} from "@forge/api";

export async function getProject(projectKey) {
    // TODO cache?
    return await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => response.json());
}

export async function getApproximateIssueCount(jql) {
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