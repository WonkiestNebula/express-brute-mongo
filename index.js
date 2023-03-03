const AbstractClientStore = require('express-brute/lib/AbstractClientStore');
const moment = require('moment');

class MongoStore extends AbstractClientStore {
  constructor(getCollection, options) {
    super(arguments);
    this.options = { ...MongoStore.defaults, ...options };
    let self = this;
    getCollection(function (collection) {
      self._collection = collection;
    });
  }

  async set(key, value, lifetime, callback) {
    try {
      let _id = this.options.prefix + key;
      let expiration = lifetime
        ? moment().add(lifetime, 'seconds').toDate()
        : undefined;
      await this._collection.updateOne(
        {
          _id: _id,
        },
        {
          $set: {
            _id: _id,
            data: value,
            expires: expiration,
          },
        },
        {
          upsert: true,
        }
      );

      typeof callback == 'function' && callback(null, value);
    } catch (err) {
      typeof callback == 'function' && callback(err);
    }
  }

  async get(key, callback) {
    try {
      let _id = this.options.prefix + key;
      let collection = this._collection;

      let doc = await collection.findOne({ _id: _id });
      let data;
      if (doc && doc.expires < new Date()) {
        collection.deleteOne({ _id: _id }, { w: 0 });
        return callback();
      }
      if (doc) {
        data = doc.data;
        data.lastRequest = new Date(data.lastRequest);
        data.firstRequest = new Date(data.firstRequest);
      }
      typeof callback == 'function' && callback(null, data);
    } catch (err) {
      typeof callback == 'function' && callback(err);
    }
  }

  async reset(key, callback) {
    try {
      let _id = this.options.prefix + key;
      await this._collection.deleteOne({ _id: _id });
      typeof callback == 'function' && callback(null, arguments);
    } catch (err) {
      typeof callback == 'function' && callback(err);
    }
  }
}

MongoStore.defaults = {
  prefix: '',
};

module.exports = MongoStore;
