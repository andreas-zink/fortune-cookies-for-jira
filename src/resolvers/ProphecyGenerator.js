import {loadProphecyContext, resetProphecyContextOnNextDay, updateProphecyContext} from "./ProphecyStore";
import {getProjectMetrics} from "./ProjectAnalyzer";
import {chat} from "./OpenAiClient";

const prophecyLimit = 100;
const inactiveLicenseProphecy = `"Your fortune remains locked behind the door of opportunity. To unlock the wisdom of the cookie, activate your license.`
const limitReachedProphecy = `"Today's fortune has been fulfilled — your daily limit has been reached. Remember, patience is a virtue, and tomorrow brings new opportunities."`
const errorProphecy = `"Oops! Something went wrong with your fortune today. But fear not — every setback is a setup for a comeback."`

export async function generateProphecy(projectKey, activeLicense) {
    try {
        const prophecyContext = await loadProphecyContext(projectKey);
        resetProphecyContextOnNextDay(prophecyContext);

        if (!activeLicense) {
            console.log("Won't generate any prophecies without active license");
            return inactiveLicenseProphecy;
        } else if (isCounterExhausted(prophecyContext)) {
            console.log(`Won't generate new prophecies for ${projectKey} until tomorrow`);
            return limitReachedProphecy;
        } else {
            const projectMetrics = await getProjectMetrics(projectKey);
            const prophecy = await requestProphecy(projectMetrics, prophecyContext.history);
            if (!prophecy) {
                return errorProphecy;
            }
            await updateProphecyContext(projectKey, prophecyContext, prophecy);
            return prophecy;
        }
    } catch (error) {
        console.warn(`Exception while generating new prophecy: ${error}`);
        return errorProphecy;
    }
}

function isCounterExhausted(context) {
    return context.counter >= prophecyLimit;
}

async function requestProphecy(projectMetrics, prophecyHistory) {
    console.log(`Requesting prophecy for project ${projectMetrics.projectKey}`);
    enrichProjectMetrics(projectMetrics);
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
    enrichMessagesWithHistory(messages, prophecyHistory);
    return await chat(messages);
}

function enrichProjectMetrics(projectMetrics) {
    projectMetrics.requestTimestamp = new Date().toISOString();
}

function enrichMessagesWithHistory(messages, prophecyHistory) {
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
}
