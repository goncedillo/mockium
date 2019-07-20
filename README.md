[![Build Status](https://travis-ci.com/goncedillo/mockium.svg?branch=master)](https://travis-ci.com/goncedillo/mockium)
[![Coverage Status](https://coveralls.io/repos/github/goncedillo/mockium/badge.svg?branch=master)](https://coveralls.io/github/goncedillo/mockium?branch=master) ![node version](https://badgen.net/badge/node/>=8.0.0/green) ![UMD ready](https://img.shields.io/badge/UMD%20modules-ready-success.svg)

<p align="center">
    <img alt="mockium-logo" src="https://drive.google.com/uc?export=view&id=1XIatwEA1_4Q2g0S1_-QY4ISbUWsxdeW-">
</p>

Mockium is a simple but powerful CLI mock server based on Node.js technology.<br >
Its main purpouse is to offer to developers the posibility of building up their own mock-server in an easy and confortable way.<br >

Surprisingly, you will see the server running in your terminal, with all the logs that you could expect, as well as a CLI aside letting you to switch among diferents features in live. No reload is required.

**Mocking is cool!**

## Table of Contents

1. [Why should I use Mockium?](#Why-should-I-use-Mockium?)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Getting started](#getting-started)
5. [Feature](#features)
6. [Mock](#mocks)
7. [Scaffolding](#Scaffolding)

## Why should I use Mockium?

There are a lot of mock server in the Node.js ecosystem. Most of them, great packages with a lot features.
Besides, Mockium offers us a simple way to load our mocks with minimum rules, plus the following characteristics:

- Simple installation and boostrap
- Easy way to mock your server responses
- Scalable way to extend features and mocks
- **Hot feature exchange**. Choose your feature in live. No reloads are needed
- **Hot mock and features reloading**. You can extend and modify your mocks and features without having to stop an restart the process
- UMD compatibility mode

<p align="center">
    <img alt="mockium-logo" src="https://drive.google.com/uc?export=view&id=1OlIK_c5-De-gpgeWjUQA8gnQ3KNHOcqa">
</p>

## Installation

Install Mockium using [npm](https://www.npmjs.com/):

```bash
npm i -g mockium
```

Mockium should be installed as global dependancy. It is necessary for using the command wherever you need in any project on your system.
Furthermore, you will notice that [stmux](https://github.com/rse/stmux) is installed as a global dependency too. It is a command-line tool which permits to Mockium to split and manage terminal activities throughout [tmux](https://github.com/tmux/tmux/wiki).

Alternatively, you could install Mockium as a local dependancy. In this case, you will need to add a command in your _scripts_ section in your **package.json**:

```js
// package.json
{
...
    "scripts": {
        ...
        "mockium": "mockium"
    }
}
```

On the other hand, you could want to use it as a not installed dependancy with `npx` instead of `npm` installation:

```bash
npx mockium
```

It is discouraged because this command will download always third dependancies, like `stmux`, which increases the execution time.

## Usage

Just one command and the magic happens:

```bash
mockium
```

Mockium will understand that all your features and mocks are sited in the root folder of your project, in `features` and `mocks` folder by default.
Of course, you can change this configuration using some of the following optional parameters:

| Property                    | Default  |                                                     |
| --------------------------- | -------- | --------------------------------------------------- |
| -s \| --server-folder       | .        | Relative path that contains all the Mockium's stuff |
| -f \| --features-folder     | features | Name of the folder that contains features files     |
| -m \| --mocks-folder        | mocks    | Name of the folder that contains mocks files        |
| -e \| --features-extension  | feature  | Extension chained to the feature file name          |
| -x \| --mocks-extension     | mock     | Extension chained to the mock file name             |
| -b \| --feature-base        | base     | Name of the base feature file                       |
| -p \| --server-port         | 5000     | Port where the server will be deployed              |
| -r \| --server-bridge-port  | 5001     | Port where the socket server will be deployed       |

## Getting started

Mockium needs to be fed with feature files.
All the structure and extensions showed in this manual are completly optionals. They all can be overwritten by command params.

The server has two main actors: **features** and **mocks** files. They perform the actual framework of this module.

### Features

In Mockium, features are a group of mocks. It means that we can define diferent features using diferent mock files and reuse them.

These files has to accomplish the following model:

| Property    | Required | Type     | Value                       |
| ----------- | -------- | -------- | --------------------------- |
| name        | \*       | _string_ | Name of this feature        |
| description |          | _string_ | Description of this feature |
| mocks       | \*       | _array_  | List of mock objects        |

e.g.

```js
// mockium-files/features/base.feature.js

const mock1 = require("../mocks/mock1.mock");
const mock2 = require("../mocks/mock2.mock");
...

module.exports = {
    "name": "myFeature",
    "description": "The awesome data that this feature contains",
    "mocks": [
        mock1,
        mock2,
        ...
    ]
}
```

### Mocks

A mock object is presented as a real response to a server request.
The mock's model has to respect some defined properties:

| Property        | Required | Type              | Value                                                                                                                          |
| --------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| url             | \*       |  *string*         | Server url which will be mocked. Query and url params are supported                                                            |
| method          | \*       | _string_          | Http verb of the request (GET, POST, PUT ...)                                                                                  |
| request         |          | _object_          | Properties related to the request                                                                                              |
| request.headers |          | _object_          | Map of request headers (key/value expected)                                                                                    |
| request.body    |          | _object_          | Map of request sent values in a no GET format                                                                                  |
| response        | \*       | _object_          | Properties related to the request                                                                                              |
| response.status | \*       | _number/string_   | Response Http code (200, 201, 400, 500 ...)                                                                                    |
| response.body   |          | _object/function_ | Object with the response data of the request. Optionally, It could be a function, which will be called to execute the response |

e.g:

```js
// mockium-files/mocks/mock1.mock.js

module.exports = {
    url: "/some_url/:id/resource?filter=smth",
    method: "GET",
    request: {
        headers: {
            Accept: "application/json"
        }
    },
    response: {
        status: 200,
        body: {
            "someData": {
                ...
            }
        }
    }
}
```

All the modules can be performed in a CommonJS way as well as in a ESMolues way. It means that the both main systems (**require** and **import**) are supported in features and mocks.

### Scaffolding

Mockium gives you whole freedom to organize your features and mocks as you want. No rules are defined at this point.

The library proposes a scaffolding, but you are completly free of choosing whichever you think that fits better for your project:

```bash
project
+-- mockium-files
|   +-- features
|   |   +-- base.feature.js
|   |   +-- other.feature.js
|   +-- mocks
|   |   +-- mock1.js
|   |   +-- mock2.js
|   |   +-- mock3.js

# command to launch
# mockium -s ./mockium-files -f features -m mocks
```

#### Feature files

As convention, the library will be looking for files with **_feature_** as default subextension (e.g. _my_atonishing.**feature**.js_). Besides, you can always change this subextension using the optional _--features-extension_ parameter exposing your preference.

```bash
mockium --features-extension my-flag
# Our features would be namely xxxx.myflag.js
```

#### Mock files

However, you are completely free to organize and name your mock files, since they will be imported into the features.

#### Feature base

Mockium needs to load a base feature as default. It is mandatory to use a base feature.<br>
The reason is because the library have to deploy the regular services in order to cover, at least, the happy path. However, the rest of the features will be loaded on top of the base, overwritten or extending the endpoints registered as intial base feature.

In order to change the name of the base feature file you need to use the _--features-base_ flag as optional command:

```bash
mockium --features-base happypath
# The base feature would be named as happypath.feature.js
```
