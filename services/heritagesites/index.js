const fs = require('fs');
const path = require('path');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const database = require('./database.json');

const sitesByCountryIndex = database.reduce((acc, site) => {
  site.countries.forEach(code => {
    acc[code] = acc[code] || [];
    acc[code].push(site);
  });
  return acc;
}, {});

const sitesByContinentIndex = database.reduce((acc, site) => {
  site.continents.forEach(code => {
    acc[code] = acc[code] || [];
    acc[code].push(site);
  });
  return acc;
}, {});

const { stitchingDirectivesTypeDefs } = stitchingDirectives();
const typeDefs = `
  ${stitchingDirectivesTypeDefs}
  ${fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8')}
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      heritageSite: (_root, { id }) => database.find(s => s.id === Number(id)) || new Error('not found'),
      _countries: (_root, { codes }) => codes.map(code => ({ code })),
      _continents: (_root, { codes }) => codes.map(code => ({ code })),
      _sdl: () => typeDefs,
    },
    HeritageSite: {
      countries: (root) => root.countries.map(code => ({ code })),
      continents: (root) => root.continents.map(code => ({ code })),
    },
    Country: {
      heritageSites: (root) => sitesByCountryIndex[root.code],
    },
    Continent: {
      heritageSites: (root) => sitesByContinentIndex[root.code],
    },
  }
});

const app = express();
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
app.listen(4001, () => console.log('heritagesites running at http://localhost:4001/graphql'));
