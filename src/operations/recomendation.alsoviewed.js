/**
 * ## `recomendation.alsoviewed` operation factory
 *
 * Get Products also viewed by other cutomers while viewing a Product
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const op = {
    handler: ({ productId }, reply) => {
      base.db.models.ViewsByProduct
        .findOne({ _id: productId })
        .exec()
        .then(doc => {
          if (!doc) {
            return reply(base.utils.genericResponse({ alsoViewed: [] }));
          }
          return reply(base.utils.genericResponse({ alsoViewed: doc.related }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));

    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
