const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Try load Postgres, MongoDB, Redis drivers dynamically
let pg = null;
let mongoose = null;
let redis = null;

try { pg = require('pg'); } catch (e) {}
try { mongoose = require('mongoose'); } catch (e) {}
try { redis = require('redis'); } catch (e) {}

const dbPath = path.resolve(__dirname, '../insightx.db');
let sqliteDb = null;
let postgresPool = null;
let redisClient = null;
let usePostgres = false;

// Initialize Redis Client
if (process.env.REDIS_URL && redis) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect()
    .then(() => console.log('Connected to Redis Cache Server'))
    .catch((err) => console.warn('Failed to connect to Redis:', err.message));
}

// Initialize MongoDB (using Mongoose)
let MongoEvent = null;
if (process.env.MONGO_URI && mongoose) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB Database');
      const eventSchema = new mongoose.Schema({
        eventId: String,
        projectId: String,
        eventName: String,
        userId: String,
        sessionId: String,
        timestamp: Date,
        properties: mongoose.Schema.Types.Mixed
      });
      MongoEvent = mongoose.model('Event', eventSchema);
    })
    .catch((err) => console.warn('Failed to connect to MongoDB:', err.message));
}

// Initialize PostgreSQL or SQLite
if (process.env.DATABASE_URL && pg) {
  postgresPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  usePostgres = true;
  console.log('Using PostgreSQL Pool engine.');
} else {
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Failed to connect to SQLite DB:', err.message);
    else console.log('Using SQLite fallback DB at:', dbPath);
  });
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (usePostgres) {
      postgresPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          full_name VARCHAR(100),
          role VARCHAR(50) DEFAULT 'Viewer',
          mfa_enabled INT DEFAULT 0,
          mfa_secret TEXT,
          verified INT DEFAULT 0,
          verification_token VARCHAR(100),
          reset_token VARCHAR(100)
        );
        CREATE TABLE IF NOT EXISTS organizations (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          billing_plan VARCHAR(50) DEFAULT 'Free',
          billing_status VARCHAR(50) DEFAULT 'Active'
        );
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          organization_id VARCHAR(100),
          api_key VARCHAR(100) UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          event_name VARCHAR(100) NOT NULL,
          user_id VARCHAR(100) NOT NULL,
          session_id VARCHAR(100) NOT NULL,
          timestamp VARCHAR(100) NOT NULL,
          properties TEXT
        );
        CREATE TABLE IF NOT EXISTS funnels (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          steps TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS feature_flags (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          key VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          active INT DEFAULT 1,
          rollout_percentage INT DEFAULT 100,
          rules TEXT
        );
        CREATE TABLE IF NOT EXISTS experiments (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          hypothesis TEXT,
          status VARCHAR(50) DEFAULT 'Draft',
          control_flag_id VARCHAR(100),
          variation_flag_id VARCHAR(100),
          metric_name VARCHAR(100) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS invites (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          role VARCHAR(50) DEFAULT 'Viewer',
          token VARCHAR(100) NOT NULL,
          accepted INT DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(100) NOT NULL,
          format VARCHAR(50) NOT NULL,
          schedule VARCHAR(50) NOT NULL,
          email_recipients TEXT,
          created_at VARCHAR(100) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS alert_channels (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(100) NOT NULL,
          config TEXT NOT NULL,
          active INT DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS system_logs (
          id VARCHAR(100) PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          user_email VARCHAR(100) NOT NULL,
          details TEXT,
          timestamp VARCHAR(100) NOT NULL
        );
      `)
        .then(() => resolve())
        .catch(err => reject(err));
    } else {
      sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, full_name TEXT, role TEXT DEFAULT 'Viewer', mfa_enabled INTEGER DEFAULT 0, mfa_secret TEXT, verified INTEGER DEFAULT 0, verification_token TEXT, reset_token TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, billing_plan TEXT DEFAULT 'Free', billing_status TEXT DEFAULT 'Active')`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, organization_id TEXT, api_key TEXT UNIQUE NOT NULL)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, event_name TEXT NOT NULL, user_id TEXT NOT NULL, session_id TEXT NOT NULL, timestamp TEXT NOT NULL, properties TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS funnels (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, steps TEXT NOT NULL)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS feature_flags (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, key TEXT UNIQUE NOT NULL, description TEXT, active INTEGER DEFAULT 1, rollout_percentage INTEGER DEFAULT 100, rules TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, hypothesis TEXT, status TEXT DEFAULT 'Draft', control_flag_id TEXT, variation_flag_id TEXT, metric_name TEXT NOT NULL)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT DEFAULT 'Viewer', token TEXT NOT NULL, accepted INTEGER DEFAULT 0)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, format TEXT NOT NULL, schedule TEXT NOT NULL, email_recipients TEXT, created_at TEXT NOT NULL)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS alert_channels (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, config TEXT NOT NULL, active INTEGER DEFAULT 1)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS system_logs (id TEXT PRIMARY KEY, action TEXT NOT NULL, user_email TEXT NOT NULL, details TEXT, timestamp TEXT NOT NULL)`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });
}

// Database helper functions proxying between Postgres and SQLite
function dbRun(query, params = []) {
  if (usePostgres) {
    // Replace SQLite ? placeholder with Postgres $n
    let pgQuery = query;
    params.forEach((_, i) => {
      pgQuery = pgQuery.replace('?', `$${i + 1}`);
    });
    return postgresPool.query(pgQuery, params);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

function dbGet(query, params = []) {
  if (usePostgres) {
    let pgQuery = query;
    params.forEach((_, i) => {
      pgQuery = pgQuery.replace('?', `$${i + 1}`);
    });
    return postgresPool.query(pgQuery, params).then(res => res.rows[0]);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

function dbAll(query, params = []) {
  if (usePostgres) {
    let pgQuery = query;
    params.forEach((_, i) => {
      pgQuery = pgQuery.replace('?', `$${i + 1}`);
    });
    return postgresPool.query(pgQuery, params).then(res => res.rows);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// Custom handler for high-performance telemetry event logging
async function logTelemetryEvent(eventId, projectId, eventName, userId, sessionId, timestamp, properties) {
  // 1. Write to cache cache (Redis) for live updates
  if (redisClient && redisClient.isOpen) {
    try {
      const cacheKey = `live:${projectId}`;
      const payload = JSON.stringify({ id: eventId, event_name: eventName, timestamp, properties });
      await redisClient.lPush(cacheKey, payload);
      await redisClient.lTrim(cacheKey, 0, 99); // limit to 100 elements
    } catch (e) {
      console.warn('Redis logging error:', e.message);
    }
  }

  // 2. Write to NoSQL Telemetry Store (MongoDB) if available
  if (MongoEvent) {
    try {
      const doc = new MongoEvent({
        eventId,
        projectId,
        eventName,
        userId,
        sessionId,
        timestamp: new Date(timestamp),
        properties
      });
      await doc.save();
    } catch (e) {
      console.warn('MongoDB logging error:', e.message);
    }
  }

  // 3. Fallback write to relational database (Postgres / SQLite)
  const propsStr = JSON.stringify(properties || {});
  return dbRun(
    'INSERT INTO events (id, project_id, event_name, user_id, session_id, timestamp, properties) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [eventId, projectId, eventName, userId, sessionId, timestamp, propsStr]
  );
}

function logSystemEvent(action, userEmail, details = '') {
  const id = 'log-' + Date.now() + Math.random().toString(36).substring(2, 5);
  const timestamp = new Date().toISOString();
  return dbRun(
    'INSERT INTO system_logs (id, action, user_email, details, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, action, userEmail, details, timestamp]
  ).catch(err => console.warn('System log insert failed:', err.message));
}

module.exports = {
  db: sqliteDb,
  initDatabase,
  dbRun,
  dbGet,
  dbAll,
  logTelemetryEvent,
  logSystemEvent
};
