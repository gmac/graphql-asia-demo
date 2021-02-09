# GraphQL Asia Demo

This demo combines two data sources:

1. Countries API [https://countries.trevorblades.com/](https://countries.trevorblades.com/)
2. UNESCO World Heritage Sites [data](https://whc.unesco.org/en/list/)

The countries API is a publicly available GraphQL API, while the UNESCO data is a small local GraphQL service. The two APIs are stitched into one combined gateway schema. The UNESCO app configures merged types using schema directives, while the Countries API (which we do not control) uses static merge configuration.

## Setup

```shell
yarn install
yarn start
```

**The following services are available:**

- Stitched gateway: http://localhost:4000/graphql
- UNESCO API: http://localhost:4001/graphql
- Countries API: https://countries.trevorblades.com

## Try it!

### Countries

Go to the [Countries API](https://countries.trevorblades.com) and check out some country data:

```graphql
query {
  countries {
    code
    name
    emoji
    phone
    capital
  }
}
```

### UNESCO Sites

Next go to the [UNESCO API](http://localhost:4001/graphql) and look at some UNESCO site data, which includes an extremely primitive version of the `Country`:

```graphql
query {
  unescoSite(id: 1478) {
    name
    lat
    lon
    countries {
      code
      unescoSites {
        name
      }
    }
  }
}
```

### Gateway Schema

Now go to the [stitched gateway](http://localhost:4000/graphql) and see the same query with data from the Countries API stitched into it:

```graphql
query {
  unescoSite(id: 1478) {
    name
    lat
    lon
    countries {
      code
      name
      emoji
      phone
      capital
      unescoSites {
        name
      }
    }
  }
}
```

Alternatively within the [stitched gateway](http://localhost:4000/graphql), try fetching a country from the Countries API and note that you can access UNESCO sites from it:

```graphql
query {
  country(code: "DE") {
    name
    emoji
    unescoSites {
      id
      name
    }
  }
}
```
