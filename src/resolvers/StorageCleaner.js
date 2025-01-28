import {storage} from "@forge/api";

export async function clearAllKeys() {
    console.log("Clearing all storage keys")
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