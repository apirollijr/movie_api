# 🎬 Movie API

A RESTful API built with **Node.js**, **Express**, and **MongoDB** that provides information about movies, directors, and genres. It allows users to register, log in, and manage a list of their favorite movies.

---

## 🚀 Features

- User registration and login with **JWT authentication**
- Password hashing with **bcrypt**
- View all movies or a single movie by title
- Get genre or director details
- Add/remove favorite movies
- Update user profile or deregister
- MongoDB Atlas for database storage
- Hosted on **Heroku**

---

## 🧱 Built With

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Passport.js](http://www.passportjs.org/)
- [JWT](https://jwt.io/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [Postman](https://www.postman.com/) for testing

---

## 📂 Project Structure

movie-api/
│
├── models.js
├── passport.js
├── auth.js
├── index.js
├── seed.js
├── .env
├── /public
│ └── documentation.html
└── /node_modules

yaml
Copy
Edit

---

## 📦 Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account
- TMDb API Key

### Installation

```bash
git clone https://github.com/yourusername/movie-api.git
cd movie-api
npm install
Environment Setup
Create a .env file:

ini
Copy
Edit
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=yourStrongSecret
TMDB_API_KEY=your_tmdb_key
▶️ Running the App
bash
Copy
Edit
npm start
Server will run at:
http://localhost:8080

🔐 Authentication
Uses JWT-based authentication via Passport.
Only the /login and /users routes are public. All other routes require a valid JWT.

📮 API Endpoints
Method	Endpoint	Description
GET	/movies	Get all movies
GET	/movies/:title	Get movie by title
GET	/genres/:name	Get genre info by name
GET	/directors/:name	Get director info by name
POST	/users	Register a new user
POST	/login	Login and receive JWT
PUT	/users/:username	Update user info
POST	/users/:username/favorites/:movieID	Add movie to user's favorites
DELETE	/users/:username/favorites/:movieID	Remove movie from user's favorites
DELETE	/users/:username	Deregister user

🧪 Testing the API
Use Postman to test the routes.
Send a Bearer <token> in the Authorization header for all protected routes.

🛠️ Seed Script
Run node seed.js to populate the database from a TMDb API query or local file.

🧾 License
This project is licensed under the MIT License.

✍️ Author
Anthony Pirolli
