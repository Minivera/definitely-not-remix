# Defrost
Defrost is a non-apologetic [Remix](https://remix.run/) clone created to explore the inner workings of the framework
and get rid of a lot of the magic that powers it. If you're interested in rebuilding the wheel to get rid of the fancy
decision the Remix took, then read on. If you're looking to build great full-stack apps with node.js, I recommend using
Remix instead.

> Defrost's name was inspired by various pronunciations of DEFNR, an acronym meaning "DEFinitely Not Remix".

## What is this about?

Defrost is:

- A light full-stack web framework focused in the core web APIs available to most browsers.
- A client framework that allows you to forget about data loading and focus about data presentation.
- Transparent in the ways it works, giving you full control over how you want your app to build and behave.
- Build with an MVC architecture in mind, and I make it clear.

Defrost is NOT:

- A production ready-framework or tool, use at your own risks.
- Using any magic to make your life easier. You'll have to define your exact router and handle any transpilation on
  your own.
- A full-fledged framework full of magic, you need to define everything.
- A CLI tool. Defrost doesn't ship with any CLI tooling, you'll have to run it with pure node.
- Router-powered on the client. It doesn't ship with any router implementation, you're free to use whichever you like (I like [wouter](https://www.npmjs.com/package/wouter)).

### Did you say MVC?
Many modern JavaScript frameworks use a [M]VC approach, where the framework handles the backend **C**ontrollers and
React **V**iews, and you handle the **M**odels. This is the case with Remix for example, as stated in their docs.

Defrost follows the same approach, and it gives you the ability to clearly define your controller if you want to.
Whenever a request is received by the server, Defrost handles it as you would in a more traditional MVC framework:

1. The controller function you defined for the received route and HTTP method handles the request.
2. It requests some data from any source, storing it as a model.
3. It renders and return a view using the model, optionally rendering a full page with React.

The framework provides the same `loader` and `action` functions that Remix offers, but you're also able to define
specific handlers for any HTTP method if you'd like. 

## How to use
To use the framework, you'll need to define a server and client entrypoint. I'll dive into each of those in their
own section.

If you'd like to jump straight into code, I've got a few examples in the [examples directory](./examples). I also
implemented the [Remix tutorial as a Defrost app](./examples/remixTutorial), if you'd like to explore how it compares.

### Building your server
Defrost's server is made up of a single element, the router. Defrost will not read your directory structure and doesn't
enforce any structure to your application. The router is the source of truth for server-side routing and you are free to
build it however you want.

Let's create a server entrypoint called `index.server.js` and implement a basic router.

```typescript
// index.server.js
import { frameworkRouter } from 'defrost';

const router = frameworkRouter([]);

router
    .serve(8080)
    .then(() => {
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
  const { message } = useLoaderData();
  
  return <h1>{message}</h1>;
};

const HelloView = () => (
  <DataLoader>
    <HelloComponent />
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

const RootView = ({ children }) => (
  <DataLoader>
    <div>
      {children}
    </div>
  </DataLoader>
);

const HelloLoader = (_, { parentData }) => {
  const { user } = parentData[''];
  
  return json({
    message: `Hello, ${user}!`,
  });
}

const HelloComponent = () => {
  const { message } = useLoaderData();
  
  return <h1>{message}</h1>;
};

const HelloView = () => (
  <DataLoader>
    <HelloComponent />
  </DataLoader>
);

const router = frameworkRouter([
  {
    route: '',
    render: RootView,
    loader: RootLoader,
    children: [
      {
        // route paths are always relative to their parent. Since the parent is the empty ('') root, this
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
1. The framework run the loaders in order of route. In our example, it runs the root loader first, then passes its
   result to the hello loader.
2. The framework then renders the leaf view and works backwards to render down to the root. In our example, it renders
   the hello route first, then gives the result of that render as the `children` of the root render.

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
              }
            ]
          }
        ]
      }
    ],
  },
]);
```

If we access the path `/users/bob`, the router will look at the route tree and generate the "branch" for the complete
path that matches:

```typescript
[
  { route: '' },
  { route: '/' },
  { route: '/users' },
  { route: '/:userId' },
]
```

We can look at the `<DataLoader>` component as a pointer to an element of this array. The first data loader will look at
element 0 `{ route: '' }` and find the loader data for this segment of the branch. The next data loader moves the
pointer forwards to element 1 `{ route: '/' }`, and so on. If we were to add a fifth data loader in the React tree, the
pointer would overflow, and we won't have any data to load.

You have full control of this behavior. Provided you stay within the branch loaded from the router, you can control
which segment a data loader points towards, which then impacts any children loaders. For example:

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

This can be useful to create nested structures that rely on various parts of the loaded data, but I recommend using these
alternatives whenever possible:

- Use the `useRouteLoaderData(route)` hook to fetch a specific segment's data without moving the loader pointer.
- Get the needed data from the `parentData` property of the context and only use as many data loaders as you have
  segments in your branch.

#### Actions

##### Controller methods

### Building your client

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

# Design ideas

The goal of this project is to answer Remix/RR's overly opinionated approach with something lighter that gives developers
all the tools they need to build great apps without having to force themselves to change their workflow or having to
understand any framework magic.

## Backend
Remix's approach of loaders and actions is great, and we should leverage this. MVC also has some big advantages that have
strangely been frowned upon in the JS community, from what I could see. Strangely enough, a loader is essentially a
controller method that returns a model for a view to render.

We should try to see if we can't create something simpler than Remix's approach (the main complexity being in how it
handles its magic) without any mandatory directory structure. Some ideas.

1. Make it clear the approach is essentially MVC and embrace it for clarity
   1. Users can define controllers on routes. They're exported functions or objects that will be called when the route is
      called by the router. A controller should return a response. It can also choose to render something, including a
      React application.
   2. A controller should load data from some data source, then return that or render something with it. That's the model
      in MVC.
   3. Finally, the controller can try to render a view. That view can be a React application, which can use an explicit
      `DataInjector` component that takes data from a route and injects it into the React context. On the backend, this
      component uses the preloaded data from the route structure to inject it. On the frontend, this kickstarts the
      async data loading. Users can put the injector anywhere and configure it however they want.
2. API routes are routes that don't render a React component.
3. The router should be explicit rather than implicit, no magic based on export. People can organize their code however 
   they want rather than have to follow a strict format.
4. We use Fetch from Node for network requests. You can chain controllers to reuse loaded data rather than have to
   duplicate everything.
5. The framework is a very thin API framework using a basic router (maybe something lighter than express) that takes
   care of all the data loading. People can ignore it and use express if they want. The point it to give a good start
   for new apps that just want things to work without having to learn a complete ecosystem.
   1. The router can have routes that depend on each other (nested routes), or routes that run in parallel (sibling
      routes). The router knows to call all routes that match when requesting controller data and only render the
      correct router when requesting a page. A header or query param should be used to ask for data.
   2. We don't enforce HTTP methods. Users can configure them however they want. 

## Frontend
We should make the integration with a frontend framework as seamless as possible. We'll provide a set of React
components and hooks, but nothing more to keep things light. The goal is to not force people to tailor their app to
the framework's needs, but rather give them the liberty of configuring it however they want.

1. The framework is very light on the frontend side of things. We do not provide a router or a link component, people
   can use whatever they want.
2. The framework provides a small array of components and hooks that will take care of the data fetching from the
   backend. Users own their apps, we own the full-stack connection.
   1. `<DataInjector>` is a component that can inject data based on the backend routes. If the data is not available, it
      loads it from the requested route. 
   2. The `useBackendData()` hook is then used to ask the injector for data, or trigger a load on the backend. Once
      the data is loaded, the hook injects it into the injector for caching purposes.
   3. The `useBackendAction()` hook can be used to trigger a call on the backend manually rather than at render like
      `useBackendData()`. It will only save the data in the cache if asked for it.
   4. The `useInvalidate()` will trigger a reload of all loaders.
3. The framework can handle nested react components. If a nested route renders an element and a deeper leaf also
   renders something. The leaf will be given to the parent in the `children` prop while the parent loader data is
   available in context.