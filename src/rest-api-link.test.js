import { execute, makePromise } from 'apollo-link'
import gql from 'graphql-tag'
import fetchMock from 'fetch-mock'
import RestAPILink from './rest-api-link'

describe('Query single calls', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('can run a simple query', async () => {
    expect.assertions(1)

    const link = new RestAPILink({ uri: "/api" });
    const post = { id: '1', title: 'Love apollo' };
    fetchMock.get('/api/post/1', post);

    const postTitleQuery = gql`
      query postTitle {
        post @restAPI(type: "Post", endPoint: "/post/1") {
          id
          title
        }
      }
    `

    const data = await makePromise(
      execute(link, {
        operationName: 'postTitle',
        query: postTitleQuery,
      }),
    )

    expect(data).toMatchObject({ post: { ...post, __typename: "Post" } });
  })

    it("can get query params regardless of the order", async () => {
      expect.assertions(1);

      const link = new RestAPILink({ uri: "/api" });
      const post = { id: "1", title: "Love apollo" };
      fetchMock.get("/api/post/1", post);

      const postTitleQuery = gql`query postTitle {
          post @restAPI(endPoint: "/post/1", type: "Post") {
            id
            title
          }
        }`;

      const data = await makePromise(execute(link, {
          operationName: "postTitle",
          query: postTitleQuery
        }));

      expect(data).toMatchObject({ post: { ...post, __typename: "Post" } });
    });

  it("can return array result with typename", async () => {
    expect.assertions(1);

    const link = new RestAPILink({ uri: "/api" });

    const tags = [{ name: "apollo" }, { name: "grapql" }];
    fetchMock.get("/api/tags", tags);

    const tagsQuery = gql`query tags {
        tags @restAPI(type: "[Tag]", endPoint: "/tags") {
          name
        }
      }`;

    const data = await makePromise(execute(link, {
      operationName: "tags",
      query: tagsQuery
    }));

    const tagsWithTypeName = tags.map(tag => ({ ...tag, __typename: '[Tag]'}));
    expect(data).toMatchObject({ tags: tagsWithTypeName });
  });

  it("can filter the query result", async () => {
    expect.assertions(1);

    const link = new RestAPILink({ uri: "/api" });

    const post = { id: "1", title: "Love apollo", content: "Best graphql client ever." };
    fetchMock.get("/api/post/1", post);

    const postTitleQuery = gql`query postTitle {
        post @restAPI(type: "Post", endPoint: "/post/1") {
          id
          title
        }
      }`;

    const data = await makePromise(execute(link, {
      operationName: "postWithContent",
      query: postTitleQuery
    }));

    expect(data.post.content).toBeUndefined()
  });

  it("can pass param to a query without a variable", async () => {
    expect.assertions(1);

    const link = new RestAPILink({ uri: "/api" });

    const post = { id: "1", title: "Love apollo" };
    fetchMock.get("/api/post/1", post);

    const postTitleQuery = gql`query postTitle {
        post(id: "1") @restAPI(type: "Post", endPoint: "/post/:id") {
          id
          title
        }
      }`;

    const data = await makePromise(execute(link, {
        operationName: "postTitle",
        query: postTitleQuery
      }));

    expect(data.post.title).toBe(post.title);
  });

  it("can pass param to a query with a variable", async () => {
    expect.assertions(1);

    const link = new RestAPILink({ uri: "/api" });

    const post = { id: "1", title: "Love apollo" };
    fetchMock.get("/api/post/1", post);

    const postTitleQuery = gql`query postTitle($id: ID!) {
        post(id: $id) @restAPI(type: "Post", endPoint: "/post/:id") {
          id
          title
        }
      }`;

    const data = await makePromise(execute(link, {
        operationName: "postTitle",
        query: postTitleQuery,
        variables: { id: '1' },
      }));

    expect(data.post.title).toBe(post.title);
  });
})


describe("Query multiple calls", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it("can run a query with multiple rest calls", async () => {
    expect.assertions(2);

    const link = new RestAPILink({ uri: "/api" });

    const post = { id: "1", title: "Love apollo" };
    fetchMock.get("/api/post/1", post);

    const tags = [{ name: 'apollo' }, { name: 'grapql' }];
    fetchMock.get("/api/tags", tags);
    

    const postAndTags = gql`
      query postAndTags {
        post @restAPI(type: "Post", endPoint: "/post/1") {
          id
          title
        }
        tags @restAPI(type: "[Tag]", endPoint: "/tags") {
          name
        }
      }
    `;

    const data = await makePromise(
      execute(link, {
        operationName: "postAndTags",
        query: postAndTags,
      })
    );

    expect(data.post).toBeDefined();
    expect(data.tags).toBeDefined();
  });
});