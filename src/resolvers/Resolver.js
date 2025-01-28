import Resolver from '@forge/resolver';
import {getAppContext} from "@forge/api";
import {clearProphecyContext, loadProphecyContext,} from './ProphecyStore';
import {generateProphecy} from "./ProphecyGenerator";
import {clearAllKeys} from "./StorageCleaner";

const resolver = new Resolver();

resolver.define('getProphecy', async (request) => {
    // console.log(request);
    const projectKey = getProjectKeyFromRequest(request);
    const prophecyContext = await loadProphecyContext(projectKey);
    if (prophecyContext?.prophecy) {
        return prophecyContext.prophecy;
    }
    return await generateProphecy(projectKey);
});

resolver.define('getNextProphecy', async (request) => {
    // console.log(request);
    const projectKey = getProjectKeyFromRequest(request);
    const activeLicense = getLicenseStateFromRequest(request);
    return generateProphecy(projectKey, activeLicense);
});

resolver.define('reset', async (request) => {
    const projectKey = getProjectKeyFromRequest(request);
    await clearProphecyContext(projectKey);
});

resolver.define('isDevEnv', async () => {
    return getAppContext()?.environmentType === 'DEVELOPMENT';
});

function getProjectKeyFromRequest(request) {
    return request?.context?.extension?.project?.key;
}

function getLicenseStateFromRequest(request) {
    const licenseState = request?.context?.license?.isActive;
    console.log(`License is ${licenseState ? 'active' : 'inactive'}`);
    return licenseState;
}

export const handler = resolver.getDefinitions();

export const cleanup = async ({context}) => {
    console.log('Triggered weekly cleanup');
    try {
        await clearAllKeys();
    } catch (error) {
        console.warn(`Exception while cleanup: ${error}`);
    }
}
