# Calorie Tracker App

A full-stack calorie tracking application built with HTML, CSS, JavaScript frontend and Node.js backend with PostgreSQL database.

## Features

- User authentication (login/signup)
- User profile management with BMI calculation
- Food tracking with categories
- Meal search from pre-existing database
- Calorie intake tracking
- Nutrition breakdown with pie chart
- Responsive design

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database named `calorie_tracker`
2. Run the SQL schema from `database/schema.sql` to create tables and insert sample data

### Backend Setup

1. Navigate to the server directory:
   \`\`\`bash
   cd server
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Update database connection settings in `server.js`:
   \`\`\`javascript
   const pool = new Pool({
       user: 'your_username',
       host: 'localhost',
       database: 'calorie_tracker',
       password: 'your_password',
       port: 5432,
   });
   \`\`\`

4. Update JWT secret in `server.js`:
   \`\`\`javascript
   const JWT_SECRET = 'your_jwt_secret_key';
   \`\`\`

5. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

The server will run on `http://localhost:3000`

### Frontend Setup

1. The frontend files are in the `frontend` directory
2. You can serve them using the Node.js server (they're served as static files)
3. Or use any static file server like Live Server extension in VS Code

### Usage

1. Open `http://localhost:3000` in your browser
2. Sign up for a new account
3. Complete your profile setup
4. Start tracking your food intake!

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/categories` - Get food categories
- `POST /api/categories` - Add food category
- `GET /api/foods/search` - Search foods
- `POST /api/food-entries` - Add food entry
- `GET /api/food-entries` - Get food entries for a date

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## File Structure

\`\`\`
calorie-tracker/
├── server/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── signup.html
│   ├── profile-setup.html
│   ├── dashboard.html
│   ├── styles.css
│   ├── auth.js
│   ├── profile-setup.js
│   └── dashboard.js
├── database/
│   └── schema.sql
└── README.md
