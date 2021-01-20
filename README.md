# @jrh-works/route

Basic HTTP request and response handling for Node.js.

For a quickstart, see the [usage example](#usage-example).

## Installation

`npm install @jrh-works/route`

## The Routing Configuration Function

### Usage

`const { configureRoute } = require('@jrh-works/route')`

### Syntax

```
configureRoute(options)
```

### Arguments

| Name | Type | Description |
| :-- | :-- | :-- |
| options | [Object: Options](#the-options-object) | Configuration options for [the handling function](#the-handling-function). |

### Returns

| Type | Description |
| :-- | :-- |
| [Function: Route](#the-route-function) | A configured [route function](#the-route-function). |

### Exceptions

Throws a standard `Error` if:

- The [options object](#the-options-object) does not contain [a log function](#the-log-function).

---

#### The Options Object

| Attribute | Type | Description |
| :-- | :-- | :-- |
| log | [Function: Log](#the-log-function) | A [log function](#the-log-function) which will be used to log request and response information. |

---

##### The Log Function

A function for logging information.

The function should include the properties `.error()` for logging errors and `.request()` for logging from an [HTTP Request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object.

###### Example Syntax

```
function log(value) {
  console.log(value)
}

log.error = (error) => {
  console.error(error)
}

log.request = (request) => {
  console.log(request.method, request.url)
}
```

---

## The Route Function

### Syntax

```
route(handler)
```

### Arguments

| Name | Type | Description |
| :-- | :-- | :-- |
| handler | [Function: Handler](#the-handler-function) | A [handler function](#the-handler-function) to execute. |

### Returns

No return value.

### Exceptions

Throws a standard `Error` if:

- A handler function is not present.

### Effects

- Information about the request and response will be logged using [the log function](#the-log-function).

---

#### The Handler Function

##### Syntax

```
handle(request, response)
```

#### Arguments

| Name | Type | Description |
| :-- | :-- | :-- |
| request | Object: [HTTP Request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) | A standard [HTTP Request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object. |
| response | Object: [HTTP Response](https://nodejs.org/api/http.html#http_class_http_serverresponse) | A standard [HTTP Response](https://nodejs.org/api/http.html#http_class_http_serverresponse) object. |

#### Returns

| Type | Description |
| :-- | :-- |
| Number \| [Object: RouteResponse](#the-routeresponse-object) | The value which will determine the HTTP response. |

#### Returning a Number

If the handler returns a number, the route will respond with that status (i.e. `200`). To include a JSON response in addition to a status, return a [RouteResponse](#the-routeresponse-object).

#### Exceptions

If the handler throws a standard error:

- The error will be logged using [the log function](#the-log-function).
- The route will respond with a 500 status.

If the handler throws a [handler error](#the-handler-error):

- The route will respond with the status in the handler error.

--- 

##### The RouteResponse Object

| Attribute | Type | Description |
| :-- | :-- | :-- |
| status | Number | An HTTP status code to send. |
| data | Object \| String | Data to send as a JSON response body. |

--- 

#### The Handler Error

The handler error can be thrown from within a [handler function](#the-handler-function) to customize the error status.

##### Usage

`const { handlerError } = require('@jrh-works/handle')`

##### Syntax

```
handlerError(message, options)
```

##### Arguments

| Name | Type | Description |
| :-- | :-- | :-- |
| message | String | An error message. |
| options | [Object: ErrorOptions](#the-error-options-object) | Configuration for the handler error. |

---

##### The ErrorOptions Object

| Attribute | Type | Description |
| :-- | :-- | :-- |
| status | Number | An HTTP error status code. |

--- 

## Usage Example

```javascript
const { configureRoute, handlerError } = require('@jrh-works/handle')
const log = require('./my-logger')

const route = configureRoute({ log })

const handler = (request, response) => {
  if (request.header('Authorization') !== process.env.API_KEY) {
    throw handlerError('Unauthorized request.', { status: 401 })
  }

  return 200
}

module.exports = route(handler)
```
