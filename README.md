# Apollo API Rest Link

After looking the talk of [Peggy Rayzis at Graphql Summit](https://www.youtube.com/watch?v=eHjP2WFt0zU&list=PLpi1lPB6opQywks7yYYs5jJAIRI3faRTm&index=18) I wanted to experiment on this subject as this is a need that I have in one of my app.

For now, I am playing with graphQL Abstract Syntax Tree, but my parsing is error prone.
My plan is soon to use [apollo-utilities](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-utilities)
as [here](https://github.com/apollographql/apollo-client/blob/master/packages/graphql-anywhere/src/graphql.ts)

Do not use it in production. There are still many things to do, if you want to contribute feel free to open an issue.

The goal is to allow this kind of queries :

```graphql
query me {
  post @restAPI(type: "Post", endPoint: "/post/1") {
    id
    title
  }
  user {
    name
    id
  }
}
```

So that you can first use your REST API and adopt incrementally GraphQL on your server.

Of course you do not get all the benefits of graphQL by using this package :

* Multiples requests are send when multiple `@restAPI` directives are found.
* You get all the fields from your REST endpoints : filtering is done client side.

## Example Queries

```graphql
query postTitle {
  post @restAPI(type: "Post", endPoint: "/post/1") {
    id
    title
  }
}
```

will make a call to your server and produce 

```graphql
post {
  "__typename": "Post",
  "id": 1,
  "title": "Love apollo"
}
```

You can pass a variable to a query

```graphql
query postTitle($id: ID!) {
  post(id: $id) @restAPI(type: "Post", endPoint: "/post/:id") {
    id
    title
  }
}
```


You can make multiple calls in a query

```graphql
query postAndTags {
  post @restAPI(type: "Post", endPoint: "/post/1") {
    id
    title
  }
  tags @restAPI(type: "Tag", endPoint: "/tags") {
    name
  }
}
```

Please look into the *.test file to see cases we can handle.

## Usage

```js
import RestAPILink from 'rest-api-link';

const APILink = new RestAPILink({ uri: 'example.com/api' });

const tagsQuery = gql`query tags {
  tags @restAPI(type: "Tag", endPoint: "/tags") {
    name
  }
}`;

const data = await makePromise(execute(APILink, {
  operationName: "tags",
  query: tagsQuery
}));

```

## Tests

```shell
yarn test
```
