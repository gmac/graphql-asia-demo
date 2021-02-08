const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { introspectSchema } = require('@graphql-tools/wrap');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const { stitchingDirectivesTransformer } = stitchingDirectives();
const { makeRemoteExecutor, fetchRemoteSchema } = require('./remote_utils');

async function makeGatewaySchema() {
  const unescoExec = makeRemoteExecutor('http://localhost:4001/graphql');
  const countriesExec = makeRemoteExecutor('https://countries.trevorblades.com');

  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [
      {
        schema: await fetchRemoteSchema(unescoExec),
        executor: unescoExec,
        batch: true,
      },
      {
        schema: await introspectSchema(countriesExec),
        executor: countriesExec,
        batch: true,
        merge: {
          Country: {
            selectionSet: '{ code }',
            fieldName: 'country',
            args: ({ code }) => ({ code }),
          },
          Continent: {
            selectionSet: '{ code }',
            fieldName: 'continent',
            args: ({ code }) => ({ code }),
          }
        }
      }
    ]
  });
}


makeGatewaySchema().then(schema => {
  const app = express();
  app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
  app.listen(4000, () => console.log('gateway running at http://localhost:4000/graphql'));
});
