module.exports = {
  attributes: {
    orderId: { type: 'string', required: true },
    restaurantId: { type: 'string', required: true },
    status: { type: 'string', required: true },
    vendor: { type: 'string', required: true },
    additionalData: { type: 'json' }
  }
};