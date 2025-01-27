import Resolver from '@forge/resolver';
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

resolver.define('clearProphecyContext', async (request) => {
    const projectKey = getProjectKeyFromRequest(request);
    await clearProphecyContext(projectKey);
});

function getProjectKeyFromRequest(request) {
    return request?.context?.extension?.project?.key;
}

export const handler = resolver.getDefinitions();
