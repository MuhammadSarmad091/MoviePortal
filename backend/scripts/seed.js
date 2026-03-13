/**
 * Database Seed Script
 * Seeds the database with initial data for development
 * Run: npm run seed
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { config } = require('../src/config/environment');
const User = require('../src/models/User');
const Movie = require('../src/models/Movie');
const Review = require('../src/models/Review');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Review.deleteMany({});

    // Seed users
    console.log('👥 Seeding users...');
    const users = await User.insertMany([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123' // Will be hashed by User model
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123'
      },
      {
        username: 'movie_critic',
        email: 'critic@example.com',
        password: 'password123'
      }
    ]);
    console.log(`✅ ${users.length} users created`);

    // Seed movies
    console.log('🎬 Seeding movies...');
    const movies = await Movie.insertMany([
      {
        title: 'Inception',
        description: 'A skilled thief who steals corporate secrets through dreams.',
        releaseDate: new Date('2010-07-16'),
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDMwWoN1BKJygoqW74d.jpg',
        trailerUrl: 'https://www.youtube.com/embed/YoHD3FAEEzQ',
        userId: users[0]._id,
        ratings: 0
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as The Joker wreaks havoc and chaos on Gotham.',
        releaseDate: new Date('2008-07-18'),
        posterUrl: 'https://image.tmdb.org/t/p/w500/1hqwGsOjM5awng6zuyaaIw47Bc3.jpg',
        trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        userId: users[1]._id,
        ratings: 0
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        releaseDate: new Date('2014-11-07'),
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCu244gwI5ad.jpg',
        trailerUrl: 'https://www.youtube.com/embed/zSp-IkffcOU',
        userId: users[2]._id,
        ratings: 0
      },
      {
        title: 'The Matrix',
        description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war.',
        releaseDate: new Date('1999-03-31'),
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXqfAO.jpg',
        trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
        userId: users[0]._id,
        ratings: 0
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        releaseDate: new Date('1994-10-14'),
        posterUrl: 'https://image.tmdb.org/t/p/w500/dU56MwzytWz3h3tFxqDbs7x7dVL.jpg',
        trailerUrl: 'https://www.youtube.com/embed/s7EdQ4FqbdY',
        userId: users[1]._id,
        ratings: 0
      }
    ]);
    console.log(`✅ ${movies.length} movies created`);

    // Seed reviews
    console.log('⭐ Seeding reviews...');
    const reviews = await Review.insertMany([
      {
        content: 'Absolutely mind-bending! One of the best sci-fi movies ever made.',
        rating: 9,
        movieId: movies[0]._id,
        userId: users[1]._id
      },
      {
        content: 'A masterpiece of cinema. The storytelling is incredible.',
        rating: 10,
        movieId: movies[0]._id,
        userId: users[2]._id
      },
      {
        content: 'Dark and intense. Heath Ledger gave an unforgettable performance.',
        rating: 9,
        movieId: movies[1]._id,
        userId: users[0]._id
      },
      {
        content: 'Visually stunning with a gripping plot. Highly recommended.',
        rating: 9,
        movieId: movies[2]._id,
        userId: users[0]._id
      },
      {
        content: 'A groundbreaking film that defined an era.',
        rating: 9,
        movieId: movies[3]._id,
        userId: users[1]._id
      },
      {
        content: 'Entertaining from start to finish. Great dialogue and action.',
        rating: 8,
        movieId: movies[4]._id,
        userId: users[2]._id
      }
    ]);
    console.log(`✅ ${reviews.length} reviews created`);

    // Update movie ratings based on reviews
    console.log('📊 Calculating movie ratings...');
    for (const movie of movies) {
      const movieReviews = reviews.filter(r => r.movieId.toString() === movie._id.toString());
      if (movieReviews.length > 0) {
        const avgRating = movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
        const rounded = Math.round((avgRating + Number.EPSILON) * 10) / 10;
        await Movie.findByIdAndUpdate(movie._id, { ratings: rounded });
      }
    }
    console.log('✅ Movie ratings calculated');

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Summary: ${users.length} users, ${movies.length} movies, ${reviews.length} reviews\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
