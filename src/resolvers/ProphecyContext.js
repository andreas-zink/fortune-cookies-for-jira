import {storage} from "@forge/api";

const prophecyLimit = 100;

function getLocalDateEpochMillis() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

export function loadProphecyContext(projectKey) {
    return storage.get(getProphecyStoragekey(projectKey));
}

export function storeProphecyContext(projectKey, prophecyContext) {
    return storage.set(getProphecyStoragekey(projectKey), prophecyContext);
}

export function clearProphecyContext(projectKey) {
    return storage.delete(getProphecyStoragekey(projectKey));
}

function getProphecyStoragekey(projectKey) {
    return `${projectKey}-prophecy`;
}

export const newProphecyContext = () => {
    return {
        prophecy: null,
        history: [],
        timestamp: getLocalDateEpochMillis(),
        counter: 0
    };
}

export function setProphecy(context, prophecy) {
    context.prophecy = prophecy;
    context.history.push(prophecy);
    if (context.history > 3) {
        context.history.shift();
    }
    context.counter++;
}

export function resetCounterOnNextDay(context){
    const today = getLocalDateEpochMillis();
    if (context.timestamp < today) {
        context.history = [];
        context.timestamp = today;
        context.counter = 0;
    }
}

export function hasNotReachedProphecyLimit(context) {
    return context.counter < prophecyLimit;
}
