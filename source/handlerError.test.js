describe('handlerError()', () => {
  const handlerError = require('./handlerError')

  it('creates a handler error with the given message and status', () => {
    const result = handlerError('Error!', { status: 400 })

    expect(result).to.be.an.instanceOf(Error)
    expect(result.message).to.eq('Error!')
    expect(result.inHandler).to.be.true
    expect(result.status).to.eq(400)
  })
})
