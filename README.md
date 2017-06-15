# wolkenkit-command-tools

wolkenkit-command-tools is a collection of tools for commands.

## Installation

```bash
$ npm install wolkenkit-command-tools
```

## Quick start

First you need to integrate wolkenkit-command-tools into your application. Typically, you will only require a specific set of tools, e.g. the `only` middleware.

```javascript
const only = require('wolkenkit-command-tools').only;
```

### Using middleware

Any middleware is a function that takes a topic instance, a command and the `mark` callback as parameters. So you may use a reference to the middleware within a command definition.

Just like in Express, all middleware uses a setup function. Hence you need to call it to get the actual middleware.

#### handle.physicalEvents

This middleware handles physical events, e.g. from an IoT context. Before you are able to use it, you need to configure the physical events that you want to handle and specify their properties.

Typically, before handling physical events, you want to make sure that the device you record events for actually exists. For this, you may use the `only.ifExists` middleware.

```javascript
const commands = {
  recordEvent: [
    only.ifExists(),
    handle.physicalEvents({
      opened: {
        type: 'object',
        properties: { when: { type: 'object' }},
        required: [ 'when' ],
        additionalProperties: false
      },
      closed: {
        type: 'object',
        properties: { when: { type: 'object' }},
        required: [ 'when' ],
        additionalProperties: false
      }
    })
  ]
};
```

On the client-side, you need to send the appropriate command that contains the desired event's name and data in its `data` property.

```javascript
accessManagement.monitoring.door(id).recordEvent({
  name: 'opened',
  data: {
    when: new Date()
  }
});
```

#### only.ifExists

This middleware passes if the topic instance exists, otherwise it rejects the command.

```javascript
const commands = {
  join: [
    only.ifExists(),
    (peerGroup, command, mark) => {
      // ...
    }
  ]
};
```

#### only.ifNotExists

This middleware passes if the topic instance does not exist, otherwise it rejects the command.

```javascript
const commands = {
  start: [
    only.ifNotExists(),
    (peerGroup, command, mark) => {
      // ...
    }
  ]
};
```

#### only.ifValidatedBy

This middleware passes if the command data can be validated by the given JSON schema, otherwise it rejects the command.

```javascript
const commands = {
  start: [
    only.ifValidatedBy({
      type: 'object',
      properties: {
        // ...
      }
    }),
    (peerGroup, command, mark) => {
      // ...
    }
  ]
};
```

Alternatively, you may also provide a validation function. This function must return `true` if the validation was successful, otherwise `false`.

```javascript
const commands = {
  start: [
    only.ifValidatedBy(data => {
      // return true;
      // - or -
      // return false;
    }),
    (peerGroup, command, mark) => {
      // ...
    }
  ]
};
```

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```bash
$ bot
```

## License

Copyright (c) 2015-2017 the native web.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see [GNU Licenses](http://www.gnu.org/licenses/).
