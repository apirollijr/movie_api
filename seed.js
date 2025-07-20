require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchMovies() {
  const allMovies = [];

  for (let page = 1; page <= 10; page++) {
    const res = await axios.get(`${BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, page }
    });

    for (const movie of res.data.results) {
      const details = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
        params: { api_key: TMDB_API_KEY }
      });

      const credits = await axios.get(`${BASE_URL}/movie/${movie.id}/credits`, {
        params: { api_key: TMDB_API_KEY }
      });

      const director = credits.data.crew.find(p => p.job === 'Director');

      allMovies.push({
        Title: details.data.title,
        Description: details.data.overview,
        Genre: {
          Name: details.data.genres[0]?.name || 'Unknown',
          Description: ''
        },
        Director: {
          Name: director?.name || '',
          Bio: '',
          Birth: null,
          Death: null
        },
        ImagePath: details.data.poster_path
          ? `https://image.tmdb.org/t/p/w500${details.data.poster_path}`
          : '',
        Featured: details.data.vote_average >= 7.5
      });
    }
  }

  fs.writeFileSync('movies.json', JSON.stringify(allMovies, null, 2));
  console.log('✅ Saved movies.json with', allMovies.length, 'movies');
}

fetchMovies().catch(console.error);
