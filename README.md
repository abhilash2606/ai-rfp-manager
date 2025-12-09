# AI RFP Manager

A modern web application for managing Requests for Proposals (RFPs) with AI-powered assistance. This application streamlines the RFP creation, management, and vendor response process.

## 🌟 Features

- **RFP Creation & Management**: Create, view, and manage RFPs with an intuitive interface
- **Vendor Management**: Maintain a database of vendors and manage vendor relationships
- **AI-Powered Assistance**: Leverage AI to help draft and refine RFP content
- **Document Processing**: Upload and process various document formats (PDF, DOCX, etc.)
- **Email Integration**: Send RFPs to vendors and receive responses directly in the system
- **Proposal Comparison**: Compare vendor proposals side by side
- **User Authentication**: Secure user authentication and authorization

## 🚀 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- OpenAI API for AI features
- Nodemailer for email functionality

### Development Tools
- Nodemon for development server
- Winston for logging
- ESLint for code quality

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- MongoDB (local or cloud instance)
- OpenAI API key (for AI features)
- SMTP credentials (for email functionality)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-rfp-manager.git
cd ai-rfp-manager
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_email@example.com
```

### 3. Install Dependencies

#### Server Dependencies
```bash
cd server
npm install
```

#### Client Dependencies
```bash
cd ../client
npm install
```

### 4. Start the Application

#### Start the Backend Server
```bash
cd server
npm run dev
```

#### Start the Frontend Development Server
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## 📂 Project Structure

```
ai-rfp-manager/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── assets/        # Images, styles, etc.
│       ├── App.jsx        # Main App component
│       └── main.jsx       # Entry point
│
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
│
└── README.md             # This file
```

## 🔧 Available Scripts

### Server
- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload

### Client
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📧 Contact

For any questions or feedback, please contact (mailto: abhilashpajarla@gmail.com)

---

Built with ❤️ by Pajarla Abhilash