import {storage} from "@forge/api";

export async function loadProphecyContext(projectKey) {
    return await storage.get(getStorageKey(projectKey)) ?? newProphecyContext();
}

export function storeProphecyContext(projectKey, prophecyContext) {
    return storage.set(getStorageKey(projectKey), prophecyContext);
}

export function updateProphecyContext(projectKey, prophecyContext, prophecy) {
    setProphecy(prophecyContext, prophecy);
    return storage.set(getStorageKey(projectKey), prophecyContext);
}

function setProphecy(context, prophecy) {
    context.prophecy = prophecy;
    context.history.push(prophecy);
    if (context.history > 3) {
        context.history.shift();
    }
    context.counter++;
}

export function clearProphecyContext(projectKey) {
    return storage.delete(getStorageKey(projectKey));
}

export function resetProphecyContextOnNextDay(context) {
    const today = getLocalDateEpochMillis();
    if (context.timestamp < today) {
        context.history = [];
        context.timestamp = today;
        context.counter = 0;
    }
}

function getStorageKey(projectKey) {
    return `${projectKey}-prophecy`;
}

const newProphecyContext = () => {
    return {
        prophecy: null,
        history: [],
        timestamp: getLocalDateEpochMillis(),
        counter: 0
    };
}

function getLocalDateEpochMillis() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}
