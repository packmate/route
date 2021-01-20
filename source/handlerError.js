module.exports = (message, { status }) => {
  return Object.assign(new Error(message), {
    inHandler: true,
    status
  })
}
