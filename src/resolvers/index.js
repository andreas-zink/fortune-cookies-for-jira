import Resolver from '@forge/resolver';
import { getAppContext } from "@forge/api";
import {clearProphecyContext, loadProphecyContext,} from './ProphecyContext';
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
    return newProphecy(projectKey);
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

export const handler = resolver.getDefinitions();
