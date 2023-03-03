let expect = require("expect.js");

let MongoStore = require("../");
const MongoClient = require("mongodb").MongoClient;

let mongoStore, collection;

const clientPromise = MongoClient.connect("mongodb://127.0.0.1:27017");

describe("MongoStore", function () {
  beforeEach(async () => {
    return new Promise((resolve) => {
      mongoStore = new MongoStore(async (callback) => {
        const client = await clientPromise;
        const db = client.db("test_brute_express_mongo");
        collection = db.collection("api_limits");
        await collection.deleteMany({});
        callback(collection);
        resolve();
      });
    });
  });

  it("should be able to set a value", (done) => {
    (async () => {
      await mongoStore.set("foo", { bar: 123 }, 1000);
      let limit = await collection.findOne({ _id: "foo" });
      expect(limit.data).have.property("bar");
      expect(limit.expires).to.be.a(Date);
      done();
    })();
  });

  it("should be able to get a value", (done) => {
    (async () => {
      await mongoStore.set("foo", { bar: 123 }, 1000);
      mongoStore.get("foo", function (err, data) {
        if (err) return done(err);
        expect(data).have.property("bar");
        done();
      });
    })();
  });

  it("should return undef if expired", function (done) {
    mongoStore.set("foo", { bar: 123 }, 0, function (err) {
      if (err) return done(err);
      setTimeout(function () {
        mongoStore.get("foo", function (err, data) {
          if (err) return done(err);
          expect(data).to.be(undefined);
          done();
        });
      }, 200);
    });
  });

  it("should delete the doc if expired", function (done) {
    mongoStore.set("foo", { bar: 123 }, 0, function (err) {
      if (err) return done(err);
      setTimeout(function () {
        mongoStore.get("foo", function (err, data) {
          setTimeout(async function () {
            let d = await collection.findOne({ _id: "foo" });
            expect(d).to.be(null);
            done();
          }, 100);
        });
      }, 100);
    });
  });

  it("should be able to reset", function (done) {
    mongoStore.set("foo", { bar: 123 }, 1000, function (err) {
      if (err) return done(err);
      mongoStore.reset("foo", async function (err) {
        if (err) return done(err);

        let limit = await collection.findOne({ _id: "foo" });
        expect(limit).to.be(null);
        done();
      });
    });
  });
});
