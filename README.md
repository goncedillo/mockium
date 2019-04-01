<div style="text-align: center;">
    <img alt="mockium-logo" src="https://drive.google.com/uc?export=view&id=1XIatwEA1_4Q2g0S1_-QY4ISbUWsxdeW-">
</div>

Mockium is a simple but powerful CLI mock server based on Node.js technologies.<br >
Its main purpouse is to offer to developers the posibility of building up their own mock-server managed in an easy and confortable way.<br >

Surprisingly, you will see the server running in your terminal, with all the logs that you could expect to, as well as a CLI aside letting you to switch among diferents features in live. No reload is required.

**Mocking is cool!**

## Installation

Install Mockium using [npm](https://www.npmjs.com/):

```bash
npm i mockium
```
You should notice that [stmux](https://github.com/rse/stmux) is installed as a global dependency too. It is a command-line tool which permits to Mockium to split and manage terminal activities throughout [tmux](https://github.com/tmux/tmux/wiki).

## Usage

Just one command and the magic happens:

```bash
mockium
```

Other important optional parameter you can use as flag are the following:

| Property | Default | |
| ----------- | ----------- | ----------- |
| --mockium-folder | ./mockium | Relative path to the mockium folder |
| --features-folder | ./features | Relative path to the features folder from mockium folder |
| --features-extension | feature | Extension chained to the feature file name |
| --features-base | base | Name of the base feature file |
| --server-port | 5000 | Port where the server will be deployed  |
| --server-bridge-port | 5001 | Port where the socket server will be deployed  |

## Getting started

Mockium needs to be fed with feature files.
All the structure and extensions showed in this manual are completly optionals. They all can be overwritten by command params.

There are two main actors: **features** and **mocks** files. They perform the actual framework of this module.

### Features

In Mockium, features are a group of mocks. It means that we can define diferent features using (even reusing) diferent mock files and reuse them.

These files has to accomplish the following model:

| Property | Type | Value |
| ----------- | ----------- | ----------- |
| name | *string* | Name of this feature |
| mocks | *string []* | List of mock objects |

e.g.
```js
{
    "name": "myFeature",
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

| Property | Required | Type | Value |
| ----------- | ----------- | ----------- | ----------- |
| url | * | *string* | Server url which will be mocked. Query and url params are supported |
| method | * | *string* | Http verb of the request (GET, POST, PUT ...) |
| request |  | *object* | Properties related to the request |
| request.headers |  | *object* | Map of request headers (key/value expected) |
| request.body |  | *object* | Map of request sent values in a no GET format |
| response | * | *object* | Properties related to the request |
| response.status | * | *number/string* | Response Http code (200, 201, 400, 500 ...) |
| response.body |  | *object* | Object with the response data of the request |

e.g:

```js
{
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

### Scaffolding

Mockium gives you whole freedom to organize your features and mocks as you want. No rules are defined at this point.

The library proposes a scaffolding, but you are completly free of choosing whatever you think fits better for your project:

```
project
+-- mockium-files
|   +-- features
|   |   +-- base.feature.js
|   |   +-- other.feature.js
|   +-- mocks
|   |   +-- mock1.js
|   |   +-- mock2.js
|   |   +-- mock3.js
```

#### Feature files

As convention, the library will be looking for files with ***feature*** as default subextension (e.g. *my_atonishing.**feature**.js*). Besides, you can always change this subextension using the optional *--features-extension* parameter exposing your preference.

```bash
mockium --features-extension my-flag
# Our features would be namely xxxx.myflag.js
```

#### Mock files

On the other hand, you are completely free to organize and name your mock files, since they will be imported into the features.

#### Feature base

Mockium needs to load a base feature as default. It is mandatory to use a base feature.<br>
The reason is because the library have to deploy the regular services in order to cover the happy path. However, the rest of features will be loader on top of the base, overwritten or extending the endpoints registered as intial base.

In order to change the name of the base feature file you need to use the *--features-base* flag as optional command:

```bash
mockium --features-base happypath
# The base feature would be named as happypath.feature.js
```