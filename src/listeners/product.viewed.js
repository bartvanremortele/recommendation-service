const moment = require('moment');

function opFactory(base) {
  const maxViewByCustomer = base.config.get('maxViewByCustomer');
  const separationBetweenSessionsInMinutes = base.config.get('separationBetweenSessionsInMinutes');

  const fn = ({ json: { type, data } }) => {
    // Save history
    base.db.models.ViewsByCustomer
      .findOneAndUpdate(
        { _id: data.customerId },
        {
          $setOnInsert: { _id: data.customerId },
          $push: {
            views: {
              $each: [{ date: data.date, pid: data.productId }],
              $slice: -maxViewByCustomer
            }
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      .then(doc => {
        // Aggregate
        if (doc.views.length > 1) {
          const viewedItem = doc.views[doc.views.length - 1];
          // Loop backwards thru the history
          for (let index = doc.views.length - 1; index > 0; index--) {
            const actualItem = doc.views[index];
            const relatedItem = doc.views[index - 1];
            const diffInMinutes = moment(actualItem.date).diff(moment(relatedItem.date)) / 1000 / 60;
            // If it's not the same product, and it's the same session, store the product as related
            if (diffInMinutes < separationBetweenSessionsInMinutes) {
              if (actualItem.pid !== relatedItem.pid) {
                // 1. Create the record if not exists
                base.db.models.ViewsByProduct
                  .findOneAndUpdate(
                    { _id: relatedItem.pid },
                    { $setOnInsert: { _id: relatedItem.pid } },
                    { upsert: true, setDefaultsOnInsert: true, passRawResult: true }
                  )
                  .then(doc => {
                    // 2. Insert the array element if not exists
                    return base.db.models.ViewsByProduct
                      .findOneAndUpdate(
                        { _id: relatedItem.pid, 'related.pid': { $ne: viewedItem.pid } },
                        { $push: { related: { pid: viewedItem.pid, score: 1 } } },
                        { passRawResult: true }
                      );
                  })
                  .then(doc => {
                    // 3. Increment the score (if it wasn' created in 2.)
                    if (doc === null) {
                      return base.db.models.ViewsByProduct
                        .findOneAndUpdate(
                          { _id: relatedItem.pid, 'related.pid': viewedItem.pid },
                          { $inc: { 'related.$.score': 1 } },
                          { passRawResult: true }
                        );
                    } else {
                      return doc;
                    }
                  })
                  .then(doc => {
                    // 3. Increment the score (if it wasn' created in 2.)
                    return base.db.models.ViewsByProduct
                      .findOneAndUpdate(
                        { _id: relatedItem.pid },
                        {
                          $push: { related: { $each: [], $sort: { score: -1 } } }
                        },
                        { passRawResult: true }
                      );
                  })
                  .catch(error => base.logger.error(`[recomendation] ${error}`));
              }
            } else {
              break;
            }
          }
        }
      })
      .catch(error => base.logger.error(`[recomendation] ${error}`));
  };

  const productsChannel = base.config.get('bus:channels:products:name');
  base.bus.subscribe(`${productsChannel}.VIEWED`, fn);
}

// Exports the factory
module.exports = opFactory;


