import {startsWith, storage} from "@forge/api";

export async function clearProjectKeys(projectKey) {
    console.log(`Clearing storage keys for project ${projectKey}`);
    await deleteAllKeys(projectKey);
}

export async function clearAllKeys() {
    console.log("Clearing all storage keys")
    await deleteAllKeys(null);
}

async function deleteAllKeys(keyPrefix) {
    const keys = await queryAllKeys(keyPrefix, null);
    const promises = keys.map(key => storage.delete(key)
        .then(v => console.log(`Deleted storage key ${key}`)));
    await Promise.all(promises);
}

async function queryAllKeys(keyPrefix, cursor) {
    return await query(keyPrefix, cursor).then(async listResult => {
        const keys = listResult.results
            .map(entry => entry.key);
        if (listResult.nextCursor) {
            const nextKeys = await queryAllKeys(keyPrefix, listResult.nextCursor);
            if (nextKeys && nextKeys.length > 0) {
                keys.push(...nextKeys);
            }
        }
        return keys;
    });
}

function query(keyPrefix, cursor) {
    let queryBuilder = storage.query();
    if (keyPrefix) {
        queryBuilder = queryBuilder.where('key', startsWith(keyPrefix));
    }
    if (cursor) {
        queryBuilder = queryBuilder.cursor(cursor);
    }
    return queryBuilder.getMany();
}