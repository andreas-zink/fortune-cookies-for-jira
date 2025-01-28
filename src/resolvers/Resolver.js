import Resolver from '@forge/resolver';
import {getAppContext} from "@forge/api";
import {clearProphecyContext, loadProphecyContext,} from './ProphecyStore';
import {errorProphecy, generateProphecy} from "./ProphecyGenerator";
import {clearAllKeys} from "./StorageCleaner";

const resolver = new Resolver();

resolver.define('getProphecy', async (request) => {
    try {
        const projectKey = getProjectKeyFromRequest(request);
        const prophecyContext = await loadProphecyContext(projectKey);
        if (prophecyContext?.prophecy) {
            return prophecyContext.prophecy;
        }
        return await generateProphecy(projectKey);
    } catch (e) {
        console.error(`Failed to get current prophecy: ${e}`);
        return errorProphecy;
    }
});

resolver.define('getNextProphecy', async (request) => {
    try {
        const projectKey = getProjectKeyFromRequest(request);
        return generateProphecy(projectKey);
    } catch (e) {
        console.error(`Failed to get next prophecy: ${e}`);
        return errorProphecy;
    }
});

resolver.define('reset', async (request) => {
    try {
        const projectKey = getProjectKeyFromRequest(request);
        await clearProphecyContext(projectKey);
    } catch (e) {
        console.error(`Failed to reset prophecy: ${e}`);
    }
});

resolver.define('isDevEnv', async () => {
    try {
        return getAppContext()?.environmentType === 'DEVELOPMENT';
    } catch (e) {
        console.error(`Failed to resolve environment type: ${e}`);
        return false;
    }
});

function getProjectKeyFromRequest(request) {
    return request?.context?.extension?.project?.key;
}

export const handler = resolver.getDefinitions();

export const cleanup = async ({context}) => {
    try {
        console.log('Triggered weekly cleanup');
        await clearAllKeys();
    } catch (e) {
        console.warn(`Failed to cleanup: ${e}`);
    }
}
