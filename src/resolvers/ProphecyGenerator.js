import {
    hasNotReachedProphecyLimit,
    loadProphecyContext,
    newProphecyContext,
    resetCounterOnNextDay,
    setProphecy,
    storeProphecyContext
} from "./ProphecyContext";
import {getProjectMetrics} from "./ProjectAnalyzer";
import {chat} from "./OpenAiClient";

const limitReachedProphecy = `"Today's fortune has been fulfilled — your daily limit has been reached. Remember, patience is a virtue, and tomorrow brings new opportunities."`
const errorProphecy = `"Oops! Something went wrong with your fortune today. But fear not — every setback is a setup for a comeback."`

export async function newProphecy(projectKey) {
    try {
        const prophecyContext = await loadProphecyContext(projectKey) ?? newProphecyContext()
        resetCounterOnNextDay(prophecyContext);

        if (hasNotReachedProphecyLimit(prophecyContext)) {
            const prophecy = await getProjectMetrics(projectKey)
                .then(projectMetrics => requestProphecy(projectMetrics, prophecyContext?.history)) ?? errorProphecy;
            setProphecy(prophecyContext, prophecy)
        } else {
            prophecyContext.prophecy = limitReachedProphecy;
        }
        await storeProphecyContext(projectKey, prophecyContext);
        return prophecyContext.prophecy;
    } catch (error) {
        console.warn(`Exception while generating new prophecy: ${error}`);
        return errorProphecy;
    }
}

async function requestProphecy(projectMetrics, prophecyHistory) {
    console.log(`Requesting prophecy for project ${projectMetrics.projectKey}`);
    projectMetrics.requestTimestamp = new Date().toISOString();
    const messages = [
        {
            "role": "developer",
            "content": `Write a fortune cookie prophecy for a Jira project and consider the following rules:
                    - Approximately 10 words but max 20 words.
                    - Put your answer in double quotes.
                    - Use the given project type as context for wording, humor, topics, etc. For example project type 'software' should result in stereotypical wording for software developers.
                    - You may use the given issue metrics. They contain the project's issue types with name and description. They also contain the amount of issues by state 'open', 'in progress' and 'done'. For example, having many bugs can lead to a dark prophecy.
                    - You may take the given request timestamp into account. For example consider special holidays, religious festivals, or the current season of the year.
                    - You are allowed to be funny.
                    `
        },
        {
            "role": "user",
            "content": `${JSON.stringify(projectMetrics)}`
        }
    ]
    if (prophecyHistory && Array.isArray(prophecyHistory) && prophecyHistory.length > 0) {
        for (let i = 0; i < 3; i++) {
            messages.push({
                "role": "assistant",
                "content": `${prophecyHistory[i]}`,
            })
        }
        messages.push({
            "role": "user",
            "content": "Another one please",
        })
    }
    return await chat(messages);
}
