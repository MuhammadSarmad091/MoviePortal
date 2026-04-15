/* eslint-disable no-console */
const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, `../../../${envFile}`) });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const normalizeKey = (key) => JSON.stringify(key || {});

const ensureIndexes = async (db, collectionName, desiredIndexes) => {
  const collection = db.collection(collectionName);
  const existingIndexes = await collection.indexes();

  for (const desired of desiredIndexes) {
    const keySignature = normalizeKey(desired.key);
    const existing = existingIndexes.find((idx) => normalizeKey(idx.key) === keySignature);

    if (!existing) {
      await collection.createIndex(desired.key, {
        name: desired.name,
        unique: desired.unique || false
      });
      continue;
    }

    // If key matches but uniqueness differs, this needs manual intervention.
    if (!!existing.unique !== !!desired.unique) {
      throw new Error(
        `Index conflict on ${collectionName} for key ${keySignature}: existing unique=${!!existing.unique}, desired unique=${!!desired.unique}`
      );
    }
  }
};

const run = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required to run migrations');
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  await ensureIndexes(db, 'movies', [
    { key: { title: 1 }, name: 'uniq_movies_title', unique: true },
    { key: { userId: 1 }, name: 'idx_movies_userId' },
    { key: { createdAt: -1 }, name: 'idx_movies_createdAt_desc' },
    { key: { reviewCount: -1, ratings: -1, createdAt: -1 }, name: 'idx_movies_ranking' }
  ]);

  await ensureIndexes(db, 'reviews', [
    { key: { movieId: 1 }, name: 'idx_reviews_movieId' },
    { key: { userId: 1 }, name: 'idx_reviews_userId' },
    { key: { movieId: 1, userId: 1 }, name: 'uniq_reviews_movieId_userId', unique: true }
  ]);

  console.log('Migration 001 completed successfully');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Migration 001 failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Failed to disconnect after migration failure:', disconnectError.message);
  }
  process.exit(1);
});
