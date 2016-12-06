const base = require('microbase')();

// Register model(s)
require(base.config.get('models:viewsByCustomerModel'))(base);
require(base.config.get('models:viewsByProductModel'))(base);

// Add Product viewed listener
require(`${base.config.get('rootPath')}/listeners/product.viewed.js`)(base);

// Add operations
// base.services.addOperationsFromFolder();

module.exports = base;