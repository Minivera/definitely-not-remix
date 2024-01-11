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