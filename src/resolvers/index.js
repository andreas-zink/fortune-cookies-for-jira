import Resolver from '@forge/resolver';
import {getAppContext} from "@forge/api";
import {clearAll, clearProphecyContext, loadProphecyContext,} from './ProphecyContext';
import {newProphecy} from "./ProphecyGenerator";

const resolver = new Resolver();

resolver.define('getProphecy', async (request) => {
    // console.log(request);
    const projectKey = getProjectKeyFromRequest(request);
    const prophecyContext = await loadProphecyContext(projectKey);
    if (prophecyContext?.prophecy) {
        return prophecyContext.prophecy;
    }
    return await newProphecy(projectKey);
});

resolver.define('generateProphecy', async (request) => {
    // console.log(request);
    const projectKey = getProjectKeyFromRequest(request);
    const activeLicense = getLicenseStateFromRequest(request);
    return newProphecy(projectKey, activeLicense);
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
    console.log('Cleaning');
    try {
        await clearAll();
    } catch (error) {
        console.warn(`Exception while cleaning: ${error}`);
    }
}
