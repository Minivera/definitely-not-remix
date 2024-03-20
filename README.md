# Defrost

Defrost is a non-apologetic [Remix](https://remix.run/) clone created to explore the inner workings of the framework,
without a lot of the magic that powers it. If you're interested in rebuilding the wheel to get rid of the fancy
decisions the Remix team took, then read on. If you're looking to build great full-stack apps with node.js, I recommend
using Remix instead.

> Defrost's name was inspired by various pronunciations of DEFNR, an acronym meaning "DEFinitely Not Remix."

## What is this about?

Defrost is:

- A light full-stack web framework focused on the core web APIs available to most browsers.
- A client framework that allows you to forget about data loading and focus on data presentation.
- Transparent in the ways it works, giving you full control over how you want your app to build and behave.
- Build with an MVC architecture in mind, without hiding it.

Defrost is NOT:

- A production ready-framework or tool, use at your own risks.
- Using any magic to make your life easier. You'll have to define your exact router and handle any transpilation on
  your own.
- A full-fledged framework, the client and server won't behave the same.
- A CLI tool. Defrost doesn't ship with any CLI tooling, you'll have to run it with pure node.
- Router-powered on the client. It doesn't ship with any router implementation, you're free to use whichever you like (I
  like [wouter](https://www.npmjs.com/package/wouter)).

### Did you say MVC?

Many modern JavaScript frameworks use a [M]VC approach, where the framework handles the backend **C**ontrollers and
React **V**iews, and you handle the **M**odels. This is the case with Remix for example, as stated in their docs.

Defrost follows the same approach, and it allows you to clearly define your controller if you want to.
Whenever a request is received by the server, Defrost handles it as you would in a more traditional MVC framework:

1. The controller function you defined for the received route and HTTP method handles the request.
2. It requests some data from any source, storing it as a model.
3. It renders and returns a view using the model, optionally rendering a full page with React.

The framework provides the same `loader` and `action` functions that Remix offers, but you're also able to define
specific handlers for any HTTP method if you'd like.

## How to use

> The framework has not been released as a library and likely will not be published anytime soon. If you really want to
> use it, install it by cloning this repository. The examples in the documentation will assume it has been
> published to NPM.

To use the framework, you'll need to define a server and client entrypoint. I'll dive into each of those in their
own section.

If you'd like to jump straight into code, I've got a few examples in the [examples directory](./examples). I also
implemented the [Remix tutorial as a Defrost app](./examples/remixTutorial), if you'd like to explore how it compares.

### Building your server

Defrost's server is made up of a single element, the router. Defrost will not read your directory structure and doesn't
enforce any structure to your application. The router is the source of truth for server-side routing, and you are free
to build it the way you want.

Let's create a server entrypoint called `index.server.js` and implement a basic router.

```typescript
// index.server.js
import { frameworkRouter } from 'defrost';

const router = frameworkRouter([]);

router.serve(8080).then(() => {
  console.log('Server listening on http://localhost:8080');
});
```

Run `node index.server.js` and the app should start on port `8080`. The application doesn't have any routes at the
moment, if you open your browser at `http://localhost:8080`, you'll get a 404 error.

Each route in the router defines its path, its render method if it should render a React component, a loader to load
data in React, and an action to receive requests.

For example, let's build a hello world application:

```typescript jsx
// index.server.js
import { frameworkRouter } from 'defrost';

const HelloView = () => (
  <h1>Hello, world!</h1>
);

const router = frameworkRouter([
  {
    route: '/hello',
    render: HelloView,
  }
]);

router
  .serve(8080)
  .then(() => {
    console.log('Server listening on http://localhost:8080');
  });
```

If you restart your application and open `http://localhost:8080/hello`, you should see a very basic web page with
the hello world heading we just added.

#### Adding loaded data

Let's add some data to this application next:

```typescript jsx
// index.server.js
import { frameworkRouter, useLoaderData, json } from 'defrost';

const HelloLoader = () => {
  return json({
    message: 'Hello, World!',
  });
}

const HelloComponent = () => {
  const {message} = useLoaderData();

  return <h1>{message}</h1>;
};

const HelloView = () => (
  <DataLoader>
    <HelloComponent/>
  </DataLoader>
);

const router = frameworkRouter([
  {
    route: '/hello',
    render: HelloView,
    loader: HelloLoader,
  }
]);

router
  .serve(8080)
  .then(() => {
    console.log('Server listening on http://localhost:8080');
  });
```

There are a few things to unpack here:

1. A defrost loader works very similarly to a Remix loader. It is a function that takes the node.js request as its
   only parameter, and it must return (or throw) a node.js response. You could build the response yourself, but Defrost
   also provides the `json` helper function. Give it an object, and it will generate the correct response object.
2. We've added the `<DataLoader>` component to the render function. This component will find the loader data of its
   route and provide it in context for any child component.
3. The `useLoaderData` hook asks the nearest data loader for the loader data and returns it. We can then deconstruct
   the returned value and display it in our component.

If you restart your application and open `http://localhost:8080/hello`, it should show the same hello world message as
our previous version, but this time it's powered with loaders.

#### Loader Hierarchy

The loader does not need to be flat, however. You can create a tree of routes like you would with the directories of
an old HTML application. Each render function will have access to its route's loader data, and the children it needs to
render. Let's try adding a root to our application:

```typescript jsx
// index.server.js
import { frameworkRouter, useLoaderData, json } from 'defrost';

const RootLoader = () => {
  return json({
    user: 'Bob',
  });
}

const RootView = ({children}) => (
  <DataLoader>
    <div>
      {children}
    </div>
  </DataLoader>
);

const HelloLoader = (_, {parentData}) => {
  const {user} = parentData[''];

  return json({
    message: `Hello, ${user}!`,
  });
}

const HelloComponent = () => {
  const {message} = useLoaderData();

  return <h1>{message}</h1>;
};

const HelloView = () => (
  <DataLoader>
    <HelloComponent/>
  </DataLoader>
);

const router = frameworkRouter([
  {
    route: '',
    render: RootView,
    loader: RootLoader,
    children: [
      {
        // Route paths are always relative to their parent. Since the parent is the empty ('') root, this
        // will render on `/hello`.
        route: '/hello',
        render: HelloView,
        loader: HelloLoader,
      }
    ],
  }
]);

router
  .serve(8080)
  .then(() => {
    console.log('Server listening on http://localhost:8080');
  });
```

In this example, we've added a new root route and moved our `/hello` route as a children of the root route. The root
loader will load a hardcoded user and pass it to any hooks in its data loader. Defrost will then pass the rendered
elements from any of its children route to the root as its `children` prop. This would be your `<Outlet>` in a
React-router 6 application.

In addition, the `HelloLoader` now has this second parameter (the first parameter is always the request) for the
request's context. Any parent loader data is available in this object. Here, our root route has the path `''`, so its
data is available under `''`. All loaders are run in succession, which should avoid any duplicated data loading.

In short:

1. The framework runs the loaders in order. In our example, it runs the root loader first, then passes its result to the
   hello loader.
2. The framework then renders the leaf view and works backwards to render down to the root. In our example, it renders
   the hello route first, then gives the result of that render as the `children` of the root render.

This gives you complete control over the application's structure, which is informed by your router's structure.
Defrost will never do any magical rendering for you. If you want to make sure of some of the more advanced features of
Remix, such as the `<Outlet />` component, you will need to integrate react-router manually.

You can add providers by using the `appWrapper` option on the `router.serve` call, like this:

```typescript jsx
router
  .serve(8080, {
    appWrapper: (request: Request, app: ReactElement | null) => (
      // Root could be your application's root element that apply to all pages. Since Defrost doesn't inject
      // anything in an HTML document. We recommend adding the base structure of a HTML page here, see
      // [the examples](./examples/bloggingApp/client/Root.tsx).
      <Root>
        {/* Add your router and any root provider here */}
        <Router>{app}</Router>
      </Root>
    ),
  })
  .then(() => {
    console.log('Server listening on http://localhost:8080');
  });
```

##### How does this work?

The `<DataLoader>` component will know which data to load for each route, but we do need to provide as many loaders as
we have nodes in the tree. This is because the data loading process works using the route branch. For this router, for
example:

```typescript
const router = frameworkRouter([
  {
    route: '',
    children: [
      {
        route: '/',
        children: [
          {
            route: '/users',
            children: [
              {
                // Remember that all routes are relative to their parents, this is hit on `/users/:userId`. You can
                // keep or omit the starting slash. We use the express pattern for route parameters.
                route: '/:userId',
              },
            ],
          },
        ],
      },
    ],
  },
]);
```

If we access the path `/users/bob`, the router will look at the route tree and generate the "branch" for the complete
path that matches:

```typescript
[{ route: '' }, { route: '/' }, { route: '/users' }, { route: '/:userId' }];
```

We can look at the `<DataLoader>` component as a pointer to an element of this array. The first data loader will look at
element 0 `{ route: '' }` and find the loader data for this segment of the branch. The next data loader moves the
pointer forwards to element 1 `{ route: '/' }`, and so on. If we were to add a fifth data loader in the React tree, the
pointer would overflow, and we wouldn't have any data to load.

You have full control of this behavior. Provided you stay within the branch loaded from the router, you can control
which segment a data loader points towards, which then impacts any child loaders. For example:

```typescript jsx
<DataLoader route="/users">
  // Pointer is at /users
  <DataLoader route="/">
    // Pointer changes to /
    <DataLoader>
      // Pointer is now at /users again, the default behavior moves the pointer forward
    </DataLoader>
  </DataLoader>
</DataLoader>
```

This can be useful to create nested structures that rely on various parts of the loaded data, but I recommend using
these
alternatives whenever possible:

- Use the `useRouteLoaderData(route)` hook to fetch a specific segment's data without moving the loader pointer.
- Get the needed data from the `parentData` property of the context and only use as many data loaders as you have
  segments in your branch.

#### Actions

An action is a catch-all controller function that will receive every request sent to the current route, either
through a normal API call, or a form submission. They work in exactly the same way as loaders, but for any other
HTTP method than `GET`.

> If you only define an action on a controller and no loader, the action will also catch `GET` calls. In a situation
> where both loader and action exist, the loader will handler all `GET` calls, and the action will handle every
> other method.

Let's add a loader to our previous example:

```typescript jsx
// index.server.js
import { frameworkRouter, json } from 'defrost';

const HelloLoader = () => {
  return json({
    message: 'Hello, World!',
  });
};

const HelloAction = request => {
  return json({
    ok: true,
    ...request.body,
  });
};

const router = frameworkRouter([
  {
    route: '/hello',
    loader: HelloLoader,
    action: HelloAction,
  },
]);

router.serve(8080).then(() => {
  console.log('Server listening on http://localhost:8080');
});
```

The action takes a single argument, the request received by the server. The request uses the `express` typings,
check out [their docs](https://expressjs.com/en/api.html#req) for more details on the available properties.

By default, defrost includes the JSON and URL encoded `express` body parsers for convenience, so you can safely
access the `body` property on the request when you receive a JSON or URL encoded request.

Like loaders, you can return any response (or use our utility `json` and `redirect` functions), which will then be sent
back to the client. Defrost keeps actions clean, it will not add any additional headers or modify your body. Actions
can, for example, safely be used for API only routes.

##### Controller methods

The action function on a controller will catch all HTTP methods sent to the API. If you want to take specific
actions based on the HTTP method received, you will then need to check the `request.method` property. For
convenience, defrost also provides individual functions for each method.

For example, we could write this action that would do different actions based on the method:

```typescript jsx
// index.server.js
import { frameworkRouter, json } from 'defrost';

const ApiAction = request => {
  switch (request.method) {
    case 'GET':
    // Do the get action
    case 'POST':
    // Do the post action
    case 'PATCH':
    // Do the patch action
    case 'DELETE':
    // Do the delete action
  }
};

const router = frameworkRouter([
  {
    route: '/api',
    action: ApiAction,
  },
]);

router.serve(8080).then(() => {
  console.log('Server listening on http://localhost:8080');
});
```

This single action can handle all the methods. We might want to break it up for convenience and organization,
however, which would be done using the specific functions like this:

```typescript jsx
// index.server.js
import { frameworkRouter, json } from 'defrost';

const router = frameworkRouter([
  {
    route: '/api',
    get: request => {
      /* Do the get action */
    },
    post: request => {
      /* Do the post action */
    },
    patch: request => {
      /* Do the patch action */
    },
    delete: request => {
      /* Do the delete action */
    },
  },
]);

router.serve(8080).then(() => {
  console.log('Server listening on http://localhost:8080');
});
```

Every valid HTTP method is supported by defrost. To see the list of available methods, please see the [express
documentation](https://expressjs.com/en/4x/api.html#routing-methods).

### Building your client app

Deforst provides utilities for defining your API and loading needs on the backend, but also components and hooks to
help with loading this data in real-time on the frontend. One of the guiding principles of defrost is to let you
define your application in any way you want. For this reason, the framework does _not_ provide any router or
structure.

There are two ways to build your application with defrost:

- Static applications with injected data
- Dynamic applications with a router

#### Building a static application

A static application is where the data is loaded once from the loaders, and injected into the components. Any
further action from the client will either cause a full page reload or a full loader reload. Let's build one
together.

First, every defrost client application requires two things:

- The `<ClientContextProvider />` wrapping any `<DataLoader />` components.
- The `<Scripts />` component injected into the head of the document, or in the body.

To build this, let's start by defining our client entry point. This script should be added to the HTML generated on
the server, see the [Using Vite](#using-vite) section for more details.

```tsx
// index.server.js
import { hydrateRoot } from 'react-dom/client';
import { ClientContextProvider, Scripts, DataLoader } from 'defrost';

import { App } from './app';

hydrateRoot(
  document,
  <ClientContextProvider>
    <head>
      <Scripts />
    </head>
    <body>
      <DataLoader>
        <App />
      </DataLoader>
    </body>
  </ClientContextProvider>
);
```

The `<ClientContextProvider />` component takes care of dynamically loading and reloading the content of the loaders
whenever a `<DataLoader />` component is rendered. Even in a static application, this provider is necessary to
inject the server rendered data into the loaders, and to reload if we invalidate the cache due to a user action.

Let's define our `<App />` component next. This specific application loads a custom message for a user using the
loaders. Any user can submit a `POST` call to the application's root to change the message they see on the screen.

```tsx
// app.tsx
import { useLoaderData } from 'defrost';

export const App = () => {
  const { message } = useLoaderData();

  return (
    <div>
      {message ? <marquee>{message}</marquee> : <span>Loading...</span>}
      <form action="/" method="POST">
        <label for="message">Message:</label>
        <br />
        <input type="text" id="message" name="message" defaultValue={message} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};
```

The application will load the message from the loaded data, which is injected from the provider. When the user
submits the form, the server will pick it up through the use of an [action](#actions) and save the new value. An
action will never return SSR-ed HTML, so submitting a form with POST will not show the page again. To make sure the
user is sent to the home page, return a `redirect` response to the home route. Let's take a look at how we might
structure the server:

```typescript jsx
// index.server.js
import { frameworkRouter, json, redirect } from 'defrost';

import { App } from './app';
import { getMessage, saveMessage } from './backend';

const HomeLoader = () => {
  // Get message from some backend
  const message = getMessage();

  return json({
    message,
  });
}

const HomeAction = request => {
  // Save the message in some backend
  saveMessage(request.body);
  // Redirect user to home page, which will trigger a GET request from the browser
  return redirect('/');
}

const router = frameworkRouter([
  {
    route: '/',
    render: () => (
      <DataLoader>
        <App/>
      </DataLoader>
    ),
    loader: HomeLoader,
    action: HomeAction,
  }
]);

router
  .serve(8080)
  .then(() => {
    console.log('Server listening on http://localhost:8080');
  });
```

It is also possible to use a client fetch call rather than a full form submit using the provided hooks. Defrost has
two hooks you can use to trigger a loader reload:

- `useInvalidate`, which fully invalidates the loader data and triggers a new request for all the loader data. This
  happens fully on the client and will not cause a page refresh. See the
  [dynamic application section](#building-a-dynamic-applications) for more details on handling data loading.
- `useFetch`, which returns a `fetch` function that will automatically trigger the loader data invalidation when
  the request resolves. The fetch implementation is very basic and will not do anything more than invalidating the
  cache, make sure to handle any errors on your end.

Using these hooks, we can rewrite the previous example like this:

```tsx
// app.tsx
import { useLoaderData, useFetch } from 'defrost';

export const App = () => {
  const { message } = useLoaderData();
  const fetch = useFetch();

  const submitForm = event => {
    event.preventDefault();
    const data = new FormData(e.target);

    // Show a loader if needed
    fetch({
      method: 'POST',
      body: JSON.stringify({
        newMessage: data.get('message'),
      }),
    });
  };

  return (
    <div>
      {message ? <marquee>{message}</marquee> : <span>Loading...</span>}
      <form action="/" method="POST">
        <label for="message">Message:</label>
        <br />
        <input type="text" id="message" name="message" defaultValue={message} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};
```

In this version, the fetch call will submit the form without reloading the page. When the action resolves, the
loader cache will be invalidated and the `message` will become `undefined`, prompting the loader. Once the
client provider has successfully fetched the loader data, the `message` will be set to its new value and shown to the
user.

#### Building a dynamic applications

The previous example showed how to submit a form using only client-side logic to avoid any full page reload.
Defrost's client provider is capable of reloading parts of a loader chain, or an entirely new loader chain, on demand.
It doesn't decide for you when this reload should happen, it instead waits for specific prompts given by your
application, giving you full control over your data.

The `useFetch` and `useInvalidate` (which is used by `useFetch`) are one way to trigger a reload, but these hooks
invalidate the entire loader cache, triggering a complete refresh of your application. This is not always ideal, as
it will cause a full reload, even if only a single loader has changed due to the action. In
applications using client-side routers, for example, a full page reload may trigger the loading state of the
application's root rather than only the current route.

The `<DataLoader />` component has a property called `shouldReload` that solves this problem. Let's look at how it
works by first updating our static application with the use of a client router. For this example, we'll be using the
awesome [wouter](https://github.com/molefrog/wouter) library.

```tsx
// index.server.js
import { hydrateRoot } from 'react-dom/client';
import { Router as Wouter, Route, Switch } from 'wouter';
import { ClientContextProvider, Scripts } from 'defrost';

import { Index } from './index'; // This would be the App from our previous example
import { User } from './user';

hydrateRoot(
  document,
  <html>
    <head>
      <Scripts />
    </head>
    <body>
      <Wouter>
        {/* The provider should be inside the router */}
        <ClientContextProvider>
          <Switch>
            <Route path="/">
              <Index />
            </Route>
            <Route path="/users/:userId">
              <User />
            </Route>
          </Switch>
        </ClientContextProvider>
      </Wouter>
    </body>
  </html>
);
```

```tsx
// user.tsx
import { DataLoader, useLoaderData } from 'defrost';

const UserComponent = () => {
  const { user } = useLoaderData();

  return <h1>Profile: {user.username}</h1>;
};

export const User = () => {
  const [matched, params] = useRoute('/users/:userId');

  return (
    <DataLoader
      shouldReload={(_, loaderParams) =>
        !matched || loaderParams.userId !== params.userId
      }
    >
      <UserComponent />
    </DataLoader>
  );
};
```

The `shouldReload` prop of the data loader takes a function with two arguments, the current route (the segment of
the URL that was matched for this loader), and the parameters extracted from that route. If the function returns
`true`, that specific data loader and its descendants will reload, leaving every ancestor data loader untouched.
This function is called on every render.

In addition, you can track if the data is loading or not using the `useIsLoading` hook, like this:

```tsx
// user.tsx
import { DataLoader, useLoaderData } from 'defrost';

const UserComponent = () => {
  const { user } = useLoaderData();
  const loading = useIsLoading();

  return loading ? <div>Loading...</div> : <h1>Profile: {user.username}</h1>;
};

/* ... */
```

With `shouldReload`, the data loaders will update if the route doesn't match. However, the provider has to receive a
request to reload from a data loader before it will trigger the invalidation process. This could lead to some
flickering as the app is not set to be loading until that invalidation happens.

To solve this, you can pass the current location from the router to the provider:

```tsx
// index.server.js
import { hydrateRoot } from 'react-dom/client';
import { Router as Wouter, Route, Switch } from 'wouter';
import { ClientContextProvider, Scripts } from 'defrost';

import { Index } from './index'; // This would be the App from our previous example
import { User } from './user';

const App = () => {
  const [location] = useLocation();

  return (
    <ClientContextProvider currentLocation={location}>
      <Switch>
        <Route path="/">
          <Index />
        </Route>
        <Route path="/users/:userId">
          <User />
        </Route>
      </Switch>
    </ClientContextProvider>
  );
};

hydrateRoot(
  document,
  <html>
    <head>
      <Scripts />
    </head>
    <body>
      <Wouter>
        <App />
      </Wouter>
    </body>
  </html>
);
```

Now that the provider is location-aware, it will know to reload the entire data loader chain if the current URL
doesn't match the route it had previously loaded. This will avoid any flicker and make sure all components are
loading when they should.

### Using Vite

By default, Defrost will run as a Node.js app. This means that it won't compile any React code or run any transformation
for you. To get all these features, you'll need to use a bundler such as Vite to transpile and bundle your client code.

Defrost is compatible with [vite's SSR mode](https://vitejs.dev/guide/ssr). Since it will take care of the SSR process,
you also need to hook into the framework's render logic. Here is an example of how to do this:

```typescript jsx
const router = frameworkRouter(/* ... */);

// This is your server's main method
const main = async () => {
  // 1. Create the vite server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: __dirname,
  });

  // 2. Add the Vite middlewares to Defrost's router
  router.use(vite.middlewares);

  // 4. Serve the application
  router
    .serve(8080, {
      // 3. Tell vite transform the resulting HTML from Deforst SSR.
      handleRender: (request: Request, html) => {
        return vite.transformIndexHtml(request.originalUrl, html);
      },
    })
    .then(() => {
      console.log('Server listening on http://localhost:8080');
    });
};

// Run your server, node doesn't like root level awaits
main();
```

## Examples

I provide examples in the [examples](./examples) directory to help with building an app with defrost. Each example
covers specific parts of the framework.

- The [Blogging app](./examples/bloggingApp) example shows all the capabilities and features of the framework in a
  single example. It should not be used as an example of how to build a great app with defrost. It shows how to
  structure a server application, all the available server features, and how to structure a client application with
  a router. The blogging app is a **dynamic** application.
- The [Todo MVC app](./examples/todoMVC) example is an implementation of the popular [TodoMVC](https://todomvc.com/)
  framework selector using defrost. It is router-less and mainly showcase how the framework handles client-server
  communication and updates. It is a good starting point for building an app with defrost. The TodoMVC app is a
  **static** application.
- The [Remix tutorial app](./examples/remixTutorial) example reimplements the
  official [Remix tutorial](https://remix.run/docs/en/main/start/tutorial)
  using defrost. Most of the features shown in the tutorial are implemented, but the minimalist approach of the
  framework makes the code more complex than Remix's. It is structured exactly the same way as the suggested
  structure from the tutorial. I recommend following the tutorial and looking at the specific ways it was
  implemented in the example to learn more about the framework.

## Framework reference

[Complete reference for all exported hooks, components, and functions](./REFERENCE.md).
