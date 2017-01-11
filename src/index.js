const raven = require('raven');
const base = require('microbase')({ extra: { raven } });

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add Product viewed listener
base.utils.loadModulesFromFolder('listeners');

// Add operations
base.services.addOperationsFromFolder();

module.exports = base;