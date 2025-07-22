# BookEase - Airbnb-like Booking Platform

A modern, lightweight booking platform built with React, Material UI, and Node.js. This application provides a complete booking workflow similar to Airbnb, allowing users to browse properties, select dates, choose guest count, and complete payments.

## 🚀 Features

### Frontend (React + Material UI)
- **Beautiful UI**: Modern, responsive design with Material UI components
- **Property Browsing**: Browse available properties with detailed information
- **Property Details**: View detailed property information with image galleries
- **Booking System**: Select dates, guest count, and calculate pricing
- **Payment Processing**: Secure payment form with credit card validation
- **Booking Confirmation**: Complete booking workflow with confirmation page
- **Mobile Responsive**: Optimized for all device sizes

### Backend (Node.js + Express)
- **RESTful API**: Clean API endpoints for properties and bookings
- **Property Management**: CRUD operations for property listings
- **Booking System**: Create and manage bookings
- **Payment Processing**: Simulated payment processing (ready for Stripe integration)
- **Data Validation**: Input validation and error handling

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material UI 5**: Beautiful, accessible UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Day.js**: Date manipulation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booking-platform
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in client directory)
   cd client && npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Project Structure

```
booking-platform/
├── server/
│   └── index.js          # Express server with API routes
├── client/
│   ├── public/
│   │   └── index.html    # Main HTML file
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Header.js
│   │   │   ├── PropertyList.js
│   │   │   ├── PropertyDetail.js
│   │   │   ├── BookingForm.js
│   │   │   ├── PaymentForm.js
│   │   │   └── BookingConfirmation.js
│   │   ├── App.js        # Main React app
│   │   └── index.js      # React entry point
│   └── package.json      # Frontend dependencies
├── package.json          # Backend dependencies
└── README.md
```

## 🔧 API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get specific property

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get specific booking

### Payments
- `POST /api/payment` - Process payment

## 🎯 User Workflow

1. **Browse Properties**: Users can view all available properties on the homepage
2. **Property Details**: Click on a property to view detailed information
3. **Book Property**: Select dates and number of guests
4. **Payment**: Enter payment information and complete the booking
5. **Confirmation**: Receive booking confirmation with all details

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Prepare for deployment**
   ```bash
   # Build the frontend
   cd client
   npm run build
   cd ..
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the React app
   - Set the build command: `cd client && npm install && npm run build`
   - Set the output directory: `client/build`

3. **Backend Deployment**
   - Deploy the backend to a service like Heroku, Railway, or Vercel Functions
   - Update the API base URL in the frontend

### Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
```

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **CORS Configuration**: Proper CORS setup for production
- **Error Handling**: Comprehensive error handling throughout the app
- **Payment Security**: Simulated secure payment processing

## 🎨 Customization

### Styling
- Modify the Material UI theme in `client/src/App.js`
- Update colors, typography, and component styles

### Adding Properties
- Add new properties to the `properties` array in `server/index.js`
- Include images, amenities, and pricing information

### Payment Integration
- Replace the simulated payment processing with real Stripe integration
- Add webhook handling for payment confirmations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using React, Material UI, and Node.js** 