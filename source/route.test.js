// ---------------------------------------------

const fake = {
  handler: stub.async(),
  request: {},

  loggers: {
    error: stub.async(),
    request: stub.async()
  },

  response: {
    end: stub(),
    send: () => fake.response,
    status: () => fake.response
  }
}

fake.log = assign(stub.async(), fake.loggers)
fake.options = { log: fake.log }

// ---------------------------------------------

describe('configureRoute()', () => {
  const { configureRoute } = require('./route')

  context('without all required options', () => {
    it('throws an error', () => {
      expect(fake.options).to.be.assuredBy(invalidObject => {
        configureRoute(invalidObject)
      })
    })
  })

  context('with all required options', () => {
    it('returns a route() function', () => {
      const result = configureRoute(fake.options)
      expect(result).to.be.a('function')
    })
  })
})

describe('route()', () => {
  const { configureRoute } = require('./route')

  context('without a handler', () => {
    it('throws an error', () => {
      const route = configureRoute(fake.options)
      expect(route).to.throw('handler')
    })
  })

  context('with a handler', () => {
    it('logs the request', async () => {
      const log = assign(stub.async(), { ...fake.loggers, request: spy.async() })
      const request = { ...fake.request }

      const route = configureRoute({ ...fake.options, log })
      await route(fake.handler)(request, fake.response)

      expect(log.request).to.have.been.calledOnceWith(request)
    })

    it('provides the request and response to the handler', async () => {
      const handler = spy.async()
      const request = { ...fake.request }
      const response = { ...fake.response }

      const route = configureRoute(fake.options)
      await route(handler)(request, response)

      expect(handler).to.have.been.calledOnceWith(request, response)
    })

    context('when the handler returns a status code', () => {
      const returnsStatus = () => 200

      it('logs the status code', async () => {
        const log = assign(spy.async(), fake.loggers)

        const route = configureRoute({ ...fake.options, log })
        await route(returnsStatus)(fake.request, fake.response)

        expect(log).to.have.been.calledOnceWithExactly(200)
      })

      it('responds with the status code', async () => {
        const response = { ...fake.response, status: spy() }

        const route = configureRoute(fake.options)
        await route(returnsStatus)(fake.request, response)

        expect(response.status).to.have.been.calledWith(200)
      })

      it('completes the response', async () => {
        const response = { ...fake.response, end: spy() }

        const route = configureRoute(fake.options)
        await route(returnsStatus)(fake.request, response)

        expect(response.end).to.have.been.calledOnce
      })
    })
 
    context('when the handler returns a response object', () => {
      const returnsResponse = () => ({ data: 'data', status: 200 })

      it('logs the status code and response data', async () => {
        const log = assign(spy.async(), fake.loggers)

        const route = configureRoute({ ...fake.options, log })
        await route(returnsResponse)(fake.request, fake.response)

        expect(log).to.have.been.calledWith(200, { data: 'data' })
      })

      it('responds with the status and payload from the response object', async () => {
        const response = { ...fake.response }
        assign(response, { send: stub(response), status: stub(response) })

        const route = configureRoute(fake.options)
        await route(returnsResponse)(fake.request, response)

        expect(response.status).to.have.been.calledOnceWith(200)
      })

      it('completes the response', async () => {
        const response = { ...fake.response, end: spy() }

        const route = configureRoute(fake.options)
        await route(returnsResponse)(fake.request, response)

        expect(response.end).to.have.been.calledOnce
      })
    })

    context('when the handler throws a generic error', () => {
      const error = new Error()
      const throws = () => { throw error }

      it('logs the error', async () => {
        const log = assign(stub.async(), { ...fake.loggers, error: spy.async() })

        const route = configureRoute({ ...fake.options, log })
        await route(throws)(fake.request, fake.response)

        expect(log.error).to.have.been.calledWith(error)
      })

      it('logs the default error status', async () => {
        const log = assign(spy.async(), fake.loggers)

        const route = configureRoute({ ...fake.options, log })
        await route(throws)(fake.request, fake.response)

        expect(log).to.have.been.calledWith(500)
      })

      it('responds with the default error status', async () => {
        const response = { ...fake.response, status: spy() }

        const route = configureRoute(fake.options)
        await route(throws)(fake.request, response)

        expect(response.status).to.have.been.calledWith(500)
      })

      it('completes the response', async () => {
        const response = { ...fake.response, end: spy() }

        const route = configureRoute(fake.options)
        await route(throws)(fake.request, response)

        expect(response.end).to.have.been.called
      })
    })
 
    context('when the handler throws a handler error', () => {
      const throwsHandlerError = () => {
        const error = assign(new Error(), { inHandler: true, status: 401 })
        throw error
      }

      it('responds with the status from the handler error', async () => {
        const response = { ...fake.response, status: spy() }

        const route = configureRoute(fake.options)
        await route(throwsHandlerError)(fake.request, response)

        expect(response.status).to.have.been.calledOnceWith(401)
      })

      it('completes the response', async () => {
        const response = { ...fake.response, end: spy() }

        const route = configureRoute(fake.options)
        await route(throwsHandlerError)(fake.request, response)

        expect(response.end).to.have.been.calledOnce
      })
    })
  })
})

