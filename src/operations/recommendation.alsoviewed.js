/**
 * ## `recommendation.alsoviewed` operation factory
 *
 * Get Products also viewed by other cutomers while viewing a Product
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const relatedLimit = base.config.get('relatedLimit');
  const productInfoServiceName = base.config.get('productInfoServiceName');
  const op = {
    cache: {
      options: {
        expiresIn: base.config.get('cache:alsoViewed')
      },
      name: 'alsoViewed',
      keyGenerator: payload => payload.productId
    },
    handler: ({ productId, limit = relatedLimit }, reply) => {
      base.db.models.ViewsByProduct
        .findOne({ _id: productId }, {}, { lean: true })
        .exec()
        .then(doc => {
          if (!doc) {
            return reply(base.utils.genericResponse({ alsoViewed: [] }));
          }

          const promises = doc.related.slice(0, limit).map(productData => {
            return base.services
              .call({
                name: productInfoServiceName
              }, {
                id: productData.pid, fields: '-variants'
              })
              .catch(error => {
                if (error.code && error.code !== 'product_not_found') base.logger.error(JSON.stringify(error));
                return { error };
              });
          });
          Promise
            .all(promises)
            .then(responses => {
              return reply(base.utils.genericResponse({
                alsoViewed: responses
                  .filter(response => response.product)
                  .map(response => response.product || {})
              }));
            })
            .catch(error => reply(base.utils.genericResponse(null, error)));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
