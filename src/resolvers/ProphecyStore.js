import {storage} from "@forge/api";

export async function loadProphecyContext(projectKey) {
    return await storage.get(getProphecyStoragekey(projectKey)) ?? newProphecyContext();
}

export function storeProphecyContext(projectKey, prophecyContext) {
    return storage.set(getProphecyStoragekey(projectKey), prophecyContext);
}

export function updateProphecyContext(projectKey, prophecyContext, prophecy) {
    setProphecy(prophecyContext, prophecy);
    return storage.set(getProphecyStoragekey(projectKey), prophecyContext);
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

export function resetProphecyContextOnNextDay(context) {
    const today = getLocalDateEpochMillis();
    if (context.timestamp < today) {
        context.history = [];
        context.timestamp = today;
        context.counter = 0;
    }
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
