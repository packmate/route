const { assureProperties } = require('@jrh-works/assure')

module.exports ={
  configureRoute(options) {
    const { log } = assureProperties([ 'log' ], { of: options, type: 'options' })

    return (handler) => {
      if (!handler) {
        throw new Error('No handler is present.')
      }

      return async (request, response) => {
        await log.request(request)

        try {
          const result = await handler(request, response)

          if (typeof(result) === 'number') {
            await log(result)
            response.status(result)
          }

          if (typeof(result) === 'object') {
            await log(result.status, { data: result.data })
            response.status(result.status).send(result.data)
          }
        }

        catch (error) {
          await log.error(error)

          let status = 500

          if (error.inHandler) {
            status = error.status
          }

          await log(status)
          response.status(status)
        }

        response.end()
      }
    }
  }
}
