const express = require("express");
const Server = require("../../../lib/server/Server");

jest.mock("../../../lib/utils/console-logger", () => ({
  printErrorMessage: jest.fn().mockImplementation(() => {}),
  printFeatureChanged: jest.fn().mockImplementation(() => {})
}));

jest.mock("express");

beforeAll(() => {
  express.mockReturnValue({
    use: () => {},
    post: () => {}
  });
});

afterAll(() => {
  jest.unmock("express");
  jest.unmock("../../../lib/utils/console-logger");
});

describe("Testing server", () => {
  beforeEach(() => {
    express.use = jest.fn();
    express.post = jest.fn();
  });

  afterEach(() => {
    express.use.mockRestore();
    express.post.mockRestore();
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
  let bodyFn;

  beforeEach(() => {
    bodyFn = jest.fn().mockReturnValue(() => [
      {
        id: 1,
        name: "Pepe"
      },
      {
        id: 2,
        name: "Antonio"
      }
    ]);

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
        body: bodyFn
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
    mock4 = {
      url: "/abb",
      method: "POST",
      response: {
        status: 201,
        body: null
      }
    };
    mockGroup1 = {
      mock1,
      mock2,
      mock4
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

  it("should get right feature selected", () => {
    const server = new Server();
    server.features = [feature1, feature2];
    server.currentFeature = "f1";

    expect(server.currentFeature === feature1.name);
  });

  it("should call next function when no feature is matched", () => {
    const req = {
      method: "PUT",
      url: "none"
    };

    const nextMock = jest.fn();

    const server = new Server();
    server.features = [feature1, feature2];
    server.currentFeature = "f1";
    server.featuresMiddleware(req, {}, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });

  it("should send the mock's status as response", () => {
    const req = {
      method: "GET",
      url: "/foo"
    };

    const res = {
      status: jest.fn().mockReturnValue({
        json: () => {}
      })
    };

    const server = new Server([feature1, feature2]);
    server.currentFeature = "f1";

    server.featuresMiddleware(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send response with body as object", () => {
    const req = {
      method: "GET",
      url: "/foo"
    };
    const fake = jest.fn();

    const res = {
      status: () => ({
        json: fake
      })
    };

    const server = new Server([feature1, feature2]);
    server.currentFeature = "f1";

    server.featuresMiddleware(req, res);

    expect(fake).toHaveBeenCalledWith(mock1.response.body);
  });

  it("should send response with empty object when body is null", () => {
    const req = {
      method: "POST",
      url: "/abb"
    };
    const fake = jest.fn();

    const res = {
      status: () => ({
        json: fake
      })
    };

    const server = new Server([feature1, feature2]);
    server.currentFeature = "f1";

    server.featuresMiddleware(req, res);

    expect(fake).toHaveBeenCalledWith({});
  });

  it("should contruct response body as function", () => {
    const req = {
      method: "GET",
      url: "/bar"
    };
    const res = {
      status: () => ({
        json: () => {}
      })
    };

    const server = new Server([feature1, feature2]);
    server.currentFeature = "f1";

    server.featuresMiddleware(req, res);

    expect(bodyFn).toHaveBeenCalled();
  });
});

describe("Test starting server", () => {
  let server;

  beforeEach(() => {
    server = new Server();

    express.mockReturnValue({
      use: () => {},
      listen: () => {},
      post: () => {}
    });
  });

  afterEach(() => {
    express.mockRestore();
  });

  it("should start an express app", () => {
    server.start({ SERVER_PORT: 2000 });

    expect(express).toHaveBeenCalled();
    expect(typeof server.app).toEqual("object");
  });
});

describe("Test running server", () => {
  let server;
  let config;
  let listenFn;
  let emitFn;

  beforeEach(() => {
    config = { SERVER_PORT: 2000 };

    listenFn = jest.fn();
    emitFn = jest.fn();

    express.mockReturnValue({
      use: () => {},
      listen: listenFn,
      post: () => {}
    });

    server = new Server();
    server.emit = emitFn;
    server.start(config);
  });

  afterEach(() => {
    express.mockRestore();
  });

  it("should remove previous listeners", () => {
    expect(listenFn).toHaveBeenCalledWith(
      config.SERVER_PORT,
      expect.any(Function)
    );
  });

  it("should notify that it is started", () => {
    server.notifyStartedServer();

    expect(emitFn).toHaveBeenCalled();
  });
});

describe("Test stopping server", () => {
  let server;
  let config;
  let closeFn;

  beforeEach(() => {
    config = { SERVER_PORT: 2000 };

    closeFn = jest.fn();

    express.mockReturnValue({
      use: () => {},
      listen: () => ({
        close: closeFn
      }),
      post: () => {}
    });

    server = new Server();
    server.start(config);
  });

  afterEach(() => {
    express.mockRestore();
  });

  it("should stop the server", () => {
    server.stop();

    expect(closeFn).toHaveBeenCalled();
  });
});

describe("Testing change features in CI mode", () => {
  let server;
  let features;
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        feature: ""
      }
    };

    res = {
      status: () => ({ send: () => {} })
    };

    server = new Server();

    features = [
      { name: "base", mocks: [] },
      { name: "foo", mocks: [] },
      { name: "bar", mocks: [] }
    ];
  });

  it("should have a function to change features in CI mode", () => {
    expect(typeof server.changeFeatureByREST === "function");
  });

  it("should set base feature when new feature is not given", () => {
    server = new Server();
    server.features = features;

    server.changeFeatureByREST(req, res);

    expect(server.currentFeature.name).toEqual("base");
  });

  it("should set base feature when new feature doesn't match with provided", () => {
    server = new Server();
    server.features = features;

    req.body.feature = "wrong";

    server.changeFeatureByREST(req, res);

    expect(server.currentFeature.name).toEqual("base");
  });

  it("should set new feature when new feature matches with provided", () => {
    server = new Server();
    server.features = features;

    req.body.feature = "foo";

    server.changeFeatureByREST(req, res);

    expect(server.currentFeature.name).toEqual("foo");
  });
});
