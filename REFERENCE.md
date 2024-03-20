## Members

<dl>
<dt><a href="#useIsLoading">useIsLoading</a></dt>
<dd><p>Returns a memoized function that will fully invalidate the cache and loaders, leading to a complete reload of the
application's data layer. Use after completing a data mutation that requires cleaning the data layer.</p></dd>
<dt><a href="#useInvalidate">useInvalidate</a></dt>
<dd><p>Returns the loaded data for the current route in the branch. This will look at the nearest <code>DataLoader</code> component
and fetch the data loaded from that loader.</p></dd>
<dt><a href="#useLoaderData">useLoaderData</a></dt>
<dd><p>Returns the loaded data for a specific route defined in the server router. Use this if you want to load data
outside the normal loader tree.</p></dd>
<dt><a href="#useRouteLoaderData">useRouteLoaderData</a></dt>
<dd><p>Returns the location's full URL. This is useful when not using a router capable of returning the complete location
data, such as the search query or hashbang. This is node-safe and will return the correct location of the request
when called on the server.</p></dd>
<dt><a href="#useLocationURL">useLocationURL</a></dt>
<dd><p>Returns a memoized getter to get the correct action to assign to a form element if you want to submit the current
route's segment as the form's action, with an additional action appended to it. This will look at the nearest
<code>DataLoader</code> parent, then use that parent's route as the source of the action.</p></dd>
<dt><a href="#useGetAction">useGetAction</a></dt>
<dd><p>Returns a memoized function to send an HTTP call to the current route in the branch using the <code>fetch</code> API. This is a
utility hook that saves you from having to track the URL you want to fetch. Use with dynamic forms or when triggering
async fetch to action.</p>
<p>Note that sending a call to a <code>GET</code> verb on a route will trigger the loader only if no <code>render</code> is defined.
Otherwise, it will return the route's HTML.</p></dd>
<dt><a href="#json">json</a></dt>
<dd><p>Creates a complete framework response that returns a redirect that can be followed by browsers or clients. It will
set the location to the given location and add no body to the response. If you want to add more headers or
properties, set them manually in the responseInit.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#useIsLoading">useIsLoading()</a></dt>
<dd><p>Returns if the nearest <code>DataLoader</code> is currently loading some data from the server. Will return true only if that
loader, or any of its parents, are loading. Any children loading data will not affect this hook.</p></dd>
<dt><a href="#json">json(value, responseInit)</a></dt>
<dd><p>Creates a complete framework response that returns a JSON body for a client request. This is a utility function
tht will return everything you need to return JSON from a loader or an action call, including headers.</p></dd>
</dl>

<a name="useIsLoading"></a>

## useIsLoading
<p>Returns a memoized function that will fully invalidate the cache and loaders, leading to a complete reload of the
application's data layer. Use after completing a data mutation that requires cleaning the data layer.</p>

**Kind**: global variable  
<a name="useInvalidate"></a>

## useInvalidate
<p>Returns the loaded data for the current route in the branch. This will look at the nearest <code>DataLoader</code> component
and fetch the data loaded from that loader.</p>

**Kind**: global variable  
**Example**  
```js
// Given this router
const router = frameworkRouter([
  {
    route: '/users',
    render: Users,
    children: [
      {
        route: '/:userId',
        render: Parent,
      },
    ],
  },
]);

const Parent = () => (
  // This renders for the route `/users/:userId`
  <DataLoader>
    <Child />
  </DataLoader>
);

const Child = () => {
  // This will get the data for the `/users/:userId` route's loader
  const data = useLoaderData();

  return (...);
};
```
<a name="useLoaderData"></a>

## useLoaderData
<p>Returns the loaded data for a specific route defined in the server router. Use this if you want to load data
outside the normal loader tree.</p>

**Kind**: global variable  
**Example**  
```js
// Given this router
const router = frameworkRouter([
  {
    route: '/users',
    render: Users,
    children: [
      {
        route: '/:userId',
        render: Parent,
      },
    ],
  },
]);

const Parent = () => (
  // This renders for the route `/users/:userId`
  <DataLoader>
    <Child />
  </DataLoader>
);

const Child = () => {
  // This will get the data for the `/users` route even if the nearest `DataLoader` has changed our current position
  // in the branch to `/users/:userId`
  const data = useRouteLoaderData('/users');

  return (...);
};
```
<a name="useRouteLoaderData"></a>

## useRouteLoaderData
<p>Returns the location's full URL. This is useful when not using a router capable of returning the complete location
data, such as the search query or hashbang. This is node-safe and will return the correct location of the request
when called on the server.</p>

**Kind**: global variable  
<a name="useLocationURL"></a>

## useLocationURL
<p>Returns a memoized getter to get the correct action to assign to a form element if you want to submit the current
route's segment as the form's action, with an additional action appended to it. This will look at the nearest
<code>DataLoader</code> parent, then use that parent's route as the source of the action.</p>

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | <p>If provided, the route parameter will be used instead of the current loaded route. This can be any of the known routes given to the server router that are currently on the branch.</p> |

**Example**  
```js
// Given this router
const router = frameworkRouter([
  {
    route: '/users',
    render: Users,
    children: [
      {
        route: '/:userId',
        render: Parent,
      },
    ],
  },
]);

const Parent = () => (
  // This renders for the route `/users/:userId`
  <DataLoader>
    <Child />
  </DataLoader>
);

const Child = () => {
  const getAction = useGetAction();

  return (
    // The action will be `/users/:userId/edit`
    <form action={getAction('edit')}>
      {...}
    </form>
  );
};
```
<a name="useGetAction"></a>

## useGetAction
<p>Returns a memoized function to send an HTTP call to the current route in the branch using the <code>fetch</code> API. This is a
utility hook that saves you from having to track the URL you want to fetch. Use with dynamic forms or when triggering
async fetch to action.</p>
<p>Note that sending a call to a <code>GET</code> verb on a route will trigger the loader only if no <code>render</code> is defined.
Otherwise, it will return the route's HTML.</p>

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | <p>If provided, the route parameter will be used instead of the current loaded route. This can be any of the known routes given to the server router that are currently on the branch.</p> |

**Example**  
```js
// Given this router
const router = frameworkRouter([
  {
    route: '/users',
    render: Users,
    children: [
      {
        route: '/:userId',
        render: Parent,
      },
    ],
  },
]);

const Parent = () => (
  // This renders for the route `/users/:userId`
  <DataLoader>
    <Child />
  </DataLoader>
);

const Child = () => {
  const fetch = useFetch();

  return (
    // Fetch will call POST on `/users/:userId`
    <button onClick={() => {
      fetch({ method: 'POST' });
    }}>Save</button>
  );
};
```
<a name="json"></a>

## json
<p>Creates a complete framework response that returns a redirect that can be followed by browsers or clients. It will
set the location to the given location and add no body to the response. If you want to add more headers or
properties, set them manually in the responseInit.</p>

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>string</code> | <p>The location to redirect to for the redirect response, see the official HTTP docs.</p> |
| responseInit | <code>ResponseInit</code> \| <code>undefined</code> | <p>The init parameters for a normal node.js response, which will be used to construct the response returned</p> |

<a name="useIsLoading"></a>

## useIsLoading()
<p>Returns if the nearest <code>DataLoader</code> is currently loading some data from the server. Will return true only if that
loader, or any of its parents, are loading. Any children loading data will not affect this hook.</p>

**Kind**: global function  
**Example**  
```js
const Parent = () => (
  // This renders for the route `/users/:userId`
  <DataLoader>
    <Child />
  </DataLoader>
);

const Child = () => {
  // This will return true if the `Parent` loader ends up reloading.
  const data = useIsLoading();

  return (...);
};
```
<a name="json"></a>

## json(value, responseInit)
<p>Creates a complete framework response that returns a JSON body for a client request. This is a utility function
tht will return everything you need to return JSON from a loader or an action call, including headers.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>any</code> | <p>The value to add as the request's body, stringifyed to JSON.</p> |
| responseInit | <code>ResponseInit</code> \| <code>undefined</code> | <p>The init parameters for a normal node.js response, which will be used to construct the response returned.</p> |

