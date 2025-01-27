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

export async function clearAll() {
    console.log("Clearing prophecy contexts")
    const keys = [];
    await queryStorge(null).then(listResult => {
        listResult.results.forEach(entry => keys.push(entry.key));
        if (listResult.nextCursor) {
            return queryStorge(listResult.nextCursor);
        } else {
            return Promise.resolve();
        }
    });

    const promises = keys.map(key => {
        console.log(`Deleting ${key}`);
        return storage.delete(key);
    });
    await Promise.all(promises);
}

function queryStorge(cursor) {
    const queryBuilder = storage.query();
    if (cursor) {
        queryBuilder.cursor(cursor);
    }
    return queryBuilder.getMany();
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

export function setProphecyInContext(context, prophecy) {
    context.prophecy = prophecy;
    context.history.push(prophecy);
    if (context.history > 3) {
        context.history.shift();
    }
    context.counter++;
}

export function resetCounterOnNextDay(context) {
    const today = getLocalDateEpochMillis();
    if (context.timestamp < today) {
        context.history = [];
        context.timestamp = today;
        context.counter = 0;
    }
}

export function exceededLimit(context) {
    return context.counter >= prophecyLimit;
}
