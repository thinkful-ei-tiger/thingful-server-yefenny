const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
describe('Auth endpoints', () => {
  let db;
  const { testUsers } = helpers.makeThingsFixtures();

  before('Connect to databse', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before('cleand db tables', () => helpers.cleanTables(db));
  afterEach('clean db tables', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());
  beforeEach('insert tests', () => helpers.seedUsers(db, testUsers));
  describe('POST auth/login', () => {
    const user = testUsers[0];
    it(`returns '400' if not user_name`, () => {
      return supertest(app)
        .post('/api/auth/login')
        .expect(400, { error: 'Missing user_name' });
    });
    it(`returns '400' if not password`, () => {
      const toSend = { user_name: 'my-user', password: '' };
      return supertest(app)
        .post('/api/auth/login')
        .send(toSend)
        .expect(400, { error: 'Missing password' });
    });
    it(`returns '401' if user_name not exist in db`, () => {
      const toSend = { user_name: 'no-existy-user', password: 'pass' };
      return supertest(app)
        .post('/api/auth/login')
        .send(toSend)
        .expect(401, { error: 'incorrect user_name or password' });
    });
    it(`returns '401' if user_name not exist in db`, () => {
      const toSend = { user_name: user.user_name, password: 'pass' };
      return supertest(app)
        .post('/api/auth/login')
        .send(toSend)
        .expect(401, { error: 'incorrect user_name or password' });
    });
    it('return 200 and JWT token using secret with valid credentials', () => {
      const toSend = { user_name: user.user_name, password: user.password };

      const expected = helpers.makeJwtToken(user);

      return supertest(app)
        .post('/api/auth/login')
        .send(toSend)
        .expect(200, { authToken: expected });
    });
  });
});
