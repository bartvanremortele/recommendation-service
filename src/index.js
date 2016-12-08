const base = require('microbase')();

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add Product viewed listener
base.utils.loadModulesFromFolder('listeners');

// Add operations
base.services.addOperationsFromFolder();

module.exports = base;