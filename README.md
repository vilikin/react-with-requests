# react-with-resources (working title)

[![Sponsored](https://img.shields.io/badge/chilicorn-sponsored-brightgreen.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAMAAADjyg5GAAABqlBMVEUAAAAzmTM3pEn%2FSTGhVSY4ZD43STdOXk5lSGAyhz41iz8xkz2HUCWFFhTFFRUzZDvbIB00Zzoyfj9zlHY0ZzmMfY0ydT0zjj92l3qjeR3dNSkoZp4ykEAzjT8ylUBlgj0yiT0ymECkwKjWqAyjuqcghpUykD%2BUQCKoQyAHb%2BgylkAyl0EynkEzmkA0mUA3mj86oUg7oUo8n0k%2FS%2Bw%2Fo0xBnE5BpU9Br0ZKo1ZLmFZOjEhesGljuzllqW50tH14aS14qm17mX9%2Bx4GAgUCEx02JySqOvpSXvI%2BYvp2orqmpzeGrQh%2Bsr6yssa2ttK6v0bKxMBy01bm4zLu5yry7yb29x77BzMPCxsLEzMXFxsXGx8fI3PLJ08vKysrKy8rL2s3MzczOH8LR0dHW19bX19fZ2dna2trc3Nzd3d3d3t3f39%2FgtZTg4ODi4uLj4%2BPlGxLl5eXm5ubnRzPn5%2Bfo6Ojp6enqfmzq6urr6%2Bvt7e3t7u3uDwvugwbu7u7v6Obv8fDz8%2FP09PT2igP29vb4%2BPj6y376%2Bu%2F7%2Bfv9%2Ff39%2Fv3%2BkAH%2FAwf%2FtwD%2F9wCyh1KfAAAAKXRSTlMABQ4VGykqLjVCTVNgdXuHj5Kaq62vt77ExNPX2%2Bju8vX6%2Bvr7%2FP7%2B%2FiiUMfUAAADTSURBVAjXBcFRTsIwHAfgX%2FtvOyjdYDUsRkFjTIwkPvjiOTyX9%2FAIJt7BF570BopEdHOOstHS%2BX0s439RGwnfuB5gSFOZAgDqjQOBivtGkCc7j%2B2e8XNzefWSu%2BsZUD1QfoTq0y6mZsUSvIkRoGYnHu6Yc63pDCjiSNE2kYLdCUAWVmK4zsxzO%2BQQFxNs5b479NHXopkbWX9U3PAwWAVSY%2FpZf1udQ7rfUpQ1CzurDPpwo16Ff2cMWjuFHX9qCV0Y0Ok4Jvh63IABUNnktl%2B6sgP%2BARIxSrT%2FMhLlAAAAAElFTkSuQmCC)](http://spiceprogram.org/oss-sponsorship)

Library that allows you to integrate your React app into a backend with ease. It might provide the following functionality:

- Define requests once and use anywhere
- Keeps track of request state (loading, error, result)
- Allows mapping of request results (and states) to components
- Makes error handling easier and allows custom logic for determining which message to show to end user

## Installation

Coming soonish

## Usage

First, we should define at least one request. Let's start with a simple one.

```js
// requests.js
import { Request } from 'react-with-resources';

export const getAllTodoItems = new Request({
  request: async () => {
    // Here we define how the todo items should be fetched
    const response = await fetch('example.com/todos');
    return await response.json();
  }
});
```

This library uses [Reacts new Context API](https://reactjs.org/docs/context.html). Therefore, we should add Provider on the top of our component tree so that our components can consume state from the RequestStateHandler that actually handles lifecycle of the requests.

```js
// App.js
import React from 'react';
import { Provider } from 'react-with-resources';

class App extends React.Component {
  render() {
    return (
      <Provider>
        <div>
          This is my app!
        </div>
      </Provider>
    );
  }
}
```

Now, we can consume the state in components using Consumer.

```js
// TodoList.js
import React from 'react';
import { Consumer } from 'react-with-resources';
import { getAllTodoItems } from './requests';

const requests = [
  getAllTodoItems
];

class TodoList extends React.Component {
  render() {
    return (
      <Consumer requests={requests}>
        {()

        }
      </Consumer>
    );
  }
}
```

## API Reference

Coming soonish