function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model ViewsByProduct');

  const viewsSchema = base.db.Schema({
    pid: { type: String, required: true },
    score: { type: Number, required: true }
  }, { _id: false, minimize: false });

  // The root schema
  const schema = base.db.Schema({
    _id: { type: String, required: true },
    related: [viewsSchema]
  }, { _id: false, minimize: false, timestamps: false, versionKey: false });

  // Enable the virtuals when converting to JSON
  schema.set('toJSON', {
    virtuals: true
  });

  // Add a method to clean the object before sending it to the client
  schema.method('toClient', function () {
    const obj = this.toJSON();
    delete obj._id;
    return obj;
  });

  const model = base.db.model('ViewsByProduct', schema);

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
