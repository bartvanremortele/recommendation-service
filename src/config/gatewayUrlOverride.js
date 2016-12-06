function gatewayUrlOverrride(/* base */) {
  const urls = {
    stock: 'http://localhost:3000',
    catalog: 'http://localhost:3002',
    tax: 'http://localhost:3003',
    promotion: 'http://localhost:3004',
    customer: 'http://localhost:3005'
  };
  return (serviceName /* , serviceVersion, operationName */) => urls[serviceName];
}

module.exports = gatewayUrlOverrride;
