export const analytics = Object.freeze({
  track(event, properties = {}) {
    const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key]) => !['name', 'anonymousId', 'playerId'].includes(key)))
    return { event, properties: safeProperties }
  },
})