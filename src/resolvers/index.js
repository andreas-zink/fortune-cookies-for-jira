import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('generateProphecy', (req) => {
  console.log(req);
  return "With every open bug ticket lies an opportunity: Fixing them will clear the path to seamless integration.";
});

export const handler = resolver.getDefinitions();
