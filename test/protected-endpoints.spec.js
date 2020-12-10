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
      it(`returns 401 'missing basic token' if there is not basic token`, () => {
        return ck.method(ck.path).expect(401, { error: 'missing basic token' });
      });

      it(` returns 401 'unauthorized request' if missing credentials`, () => {
        const user = { user_name: '', password: '' };
        const token = helpers.makeAuthToken(user);
        return ck
          .method(ck.path)
          .set('Authorization', token)
          .expect(401, { error: 'unauthorized request' });
      });
      it(` return 401 'unauthorized request' if invalid user`, () => {
        const user = { user_name: 'yefenny', password: '1235' };
        const token = helpers.makeAuthToken(user);
        return ck
          .method(ck.path)
          .set('Authorization', token)
          .expect(401, { error: 'unauthorized request' });
      });
      it(` returns 401 'unauthorized request' if invalid password`, () => {
        const user = { user_name: 'test-user-1', password: 'asss' };
        const token = helpers.makeAuthToken(user);
        return ck
          .method(ck.path)
          .set('Authorization', token)
          .expect(401, { error: 'unauthorized request' });
      });
    });
  });
});
