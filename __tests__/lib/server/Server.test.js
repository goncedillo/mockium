const express = require("express");
const Server = require("../../../lib/server/Server");

jest.mock("express");

beforeAll(() => {
  express.mockReturnValue({
    use: () => {}
  });
});

afterAll(() => {
  jest.unmock("express");
});

describe("Testing server", () => {
  beforeEach(() => {
    express.use = jest.fn();
  });

  beforeEach(() => {
    express.use.mockRestore();
  });

  it("should get an express server as app", () => {
    const server = new Server();

    expect(typeof server.app.use === "function").toBe(true);
  });

  it("should parse features grouping all its mocks", () => {
    const mockOne = {
      val: {
        url: "foo"
      }
    };
    const mockTwo = {
      val: {
        url: "bar"
      }
    };
    const mockThree = {
      val: {
        url: "sed"
      }
    };
    const feature = {
      name: "a feature",
      mocks: [mockOne, mockTwo, mockThree]
    };
    const server = new Server();
    const result = server.parseFeature(feature);

    expect.assertions(4);
    expect(result.name).toEqual(feature.name);
    expect(result.mocks[0].url).toEqual(mockOne.val.url);
    expect(result.mocks[1].url).toEqual(mockTwo.val.url);
    expect(result.mocks[2].url).toEqual(mockThree.val.url);
  });
});

describe("Testing features middleware", () => {
  let mock1;
  let mock2;
  let mock3;
  let feature1;
  let feature2;
  let mockGroup1;
  let mockGroup2;

  beforeEach(() => {
    mock1 = {
      url: "/foo",
      method: "GET",
      response: {
        status: 200,
        body: {
          id: 1,
          name: "John Doe"
        }
      }
    };
    mock2 = {
      url: "/bar",
      method: "GET",
      response: {
        status: 200,
        body: () => [
          {
            id: 1,
            name: "Pepe"
          },
          {
            id: 2,
            name: "Antonio"
          }
        ]
      }
    };
    mock3 = {
      url: "/sez",
      method: "POST",
      response: {
        status: 201,
        body: {}
      }
    };
    mockGroup1 = {
      mock1,
      mock2
    };
    mockGroup2 = {
      mock3
    };

    feature1 = {
      name: "f1",
      mocks: [mockGroup1]
    };
    feature2 = {
      name: "f2",
      mocks: [mockGroup2]
    };
  });

  it("should call next function when no feature is matched", () => {
    const req = {
      method: "PUT",
      url: "none"
    };

    const nextMock = jest.fn();

    const server = new Server([feature1, feature2]);
    server.currentFeature = "f1";
    server.featuresMiddleware(req, {}, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });
});
