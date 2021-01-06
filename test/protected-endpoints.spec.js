const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex');
const supertest = require('supertest');

describe('Protected endpoints', () => {
  let db;

  const { testUsers, testThings, testReviews } = helpers.makeThingsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
  beforeEach('Insert users', () => db('thingful_users').insert(testUsers));

  const protectedCheckpoints = [
    {
      name: 'GET /api/things/:thing_id',
      path: '/api/things/1',
      method: supertest(app).get
    },
    {
      name: 'GET /api/things/:thing_id/reviews',
      path: '/api/things/1/reviews',
      method: supertest(app).get
    },
    {
      name: 'POST /api/reviews',
      path: '/api/reviews',
      method: supertest(app).post
    }
  ];
  protectedCheckpoints.forEach((ck) => {
    describe(ck.name, () => {
      it(`returns 401 'missing bearer token' if there is not bearer token`, () => {
        return ck
          .method(ck.path)
          .expect(401, { error: 'missing bearer token' });
      });

      it(` returns 401 'unauthorized request' if invalid JWT secret`, () => {
        const user = helpers.makeUsersArray()[0];
        const token = helpers.makeAuthHeader(user, 'bad secret');
        return ck
          .method(ck.path)
          .set('Authorization', token)
          .expect(401, { error: 'unauthorized request' });
      });
      it(` return 401 'unauthorized request' if invalid user`, () => {
        const user = { user_name: 'jjjj', id: 1 };
        const token = helpers.makeAuthHeader(user);
        return ck
          .method(ck.path)
          .set('Authorization', token)
          .expect(401, { error: 'unauthorized request' });
      });
    });
  });
});
