const { fetch } = require('cross-fetch');
const { print, buildSchema } = require('graphql');

function makeRemoteExecutor(url) {
  return async ({ document, variables }) => {
    const query = typeof document === 'string' ? document : print(document);
    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json();
  };
}

async function fetchRemoteSchema(executor) {
  const result = await executor({ document: '{ _sdl }' });
  return buildSchema(result.data._sdl);
}

module.exports = {
  makeRemoteExecutor,
  fetchRemoteSchema,
};
