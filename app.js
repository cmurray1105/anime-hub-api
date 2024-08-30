// server.js or app.js (Backend)
const express = require('express');
const mysql = require('mysql2');
const app = express();
require('dotenv').config();
const port = 3001; // or any port of your choice
const dbPassword = process.env.DB_PASSWORD;
// Create MySQL connection
const connection = mysql.createConnection({
  host: 'anime-hub.cfcauw2wi08x.us-west-2.rds.amazonaws.com',
  user: 'admin',
  password: dbPassword,
  database: 'anime_hub',
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Define API endpoint to get the data
app.get('/api/show-data', (req, res) => {
  const query = `
    SELECT 
      shows.show_name,
      seasons.season_number,
      episodes.title,
      episodes.air_date,
      episodes.description,
      episodes.imdb_rating,
      episodes.url,
      episodes.intro_start,
      episodes.intro_end,
      episodes.thumbnail
    FROM shows
    JOIN seasons ON shows.id = seasons.show_id
    JOIN episodes ON seasons.id = episodes.season_id
    ORDER BY seasons.season_number, episodes.air_date
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    } else {
      // Transform the flat results into the desired JSON structure
      const showData = {
        showName: results[0].show_name,
        seasons: [],
      };

      const seasonsMap = {};

      results.forEach((row) => {
        if (!seasonsMap[row.season_number]) {
          seasonsMap[row.season_number] = {
            seasonNumber: row.season_number,
            episodes: [],
          };
          showData.seasons.push(seasonsMap[row.season_number]);
        }

        seasonsMap[row.season_number].episodes.push({
          title: row.title,
          airDate: row.air_date,
          description: row.description,
          imdbRating: row.imdb_rating,
          url: row.url,
          introStart: row.intro_start,
          introEnd: row.intro_end,
          thumbnail: row.thumbnail,
        });
      });
      console.log("SHOW DATA", showData)
      res.json(showData);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
