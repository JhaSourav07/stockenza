# Stockenza

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Stockenza is a comprehensive full-stack Point of Sale (POS), Billing, and Inventory Management system designed to streamline business operations.

## Features

- **Point of Sale (POS) & Billing**: Configurable tax rates, comprehensive transaction histories, and a seamless checkout experience.
- **Inventory Management**: Track products with detailed attributes (SKU, Category) and integrate with Cloudinary for product image uploads.
- **Dashboard & Analytics**: Real-time revenue and profit metrics with global date range filtering applied across charts and tables (Revenue & Profit Graph, Profit & Loss by Product).
- **Order Management**: Detailed order history with the ability to automatically generate and download PDF invoices for past transactions.
- **Advanced Authentication**: Secure user management leveraging robust authentication patterns, including password reset flows ("Forgot Password") and secure email verification logic.

## Tech Stack

### Frontend (`/stockenza_frontend`)
- **Core**: Next.js 16, React 19
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Utilities**: Axios, jsPDF, html2canvas (for PDF invoice generation)

### Backend (`/stockenza_backend`)
- **Core**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Security**: JWT (JSON Web Tokens), bcryptjs
- **Media & Email Storage**: Cloudinary (Image handling), Nodemailer & Resend (Email distribution)

## Project Structure

- `stockenza_frontend/`: The client-facing Next.js application containing the dashboard, POS views, inventory management, order history, and authentication forms.
- `stockenza_backend/`: The Node.js Express API handling business logic, database transactions, image uploads, and email token verification.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (Atlas or local)
- Cloudinary API credentials
- Resend / Nodemailer configured email service

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JhaSourav07/stockenza.git
   cd Stockenza
   ```

2. **Backend Setup:**
   ```bash
   cd stockenza_backend
   npm install
   ```
   *Create a `.env` file in the `stockenza_backend` directory with the following necessary variables: `MONGO_URI`, `JWT_SECRET`, your `CLOUDINARY_*` keys, and your `RESEND_API_KEY` or SMTP settings.*
   
   *Start the backend development server:*
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   # Open a new terminal
   cd ../stockenza_frontend
   npm install
   ```
   *Create a `.env.local` file in the `stockenza_frontend` directory (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000/api`).*
   
   *Start the frontend development server:*
   ```bash
   npm run dev
   ```

## License

This project is licensed under the ISC License.
