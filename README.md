# Bright Label Boutique

This project is a simple storefront that combines static HTML/CSS/JS with a minimal Node.js
server. The backend makes added products and customer orders available globally across all
clients by reading/writing JSON files on the server.

## Features

- Browse items on the homepage and shop page
- Admin panel for adding, deleting, and viewing products
- Customers add items to cart and checkout with an email address
- Orders recorded on the server and visible to admins

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Visit `http://localhost:3000` in your browser.

### Admin Panel

- Go to `/admin.html` and log in with the password defined in `script.js`.
- Add products through the form (including image upload). They will immediately appear on
the shop for all users.
- Delete products or review customer orders from the admin interface.

### Shopping Workflow

- Customers browse `/shop.html`, add items to cart and click **Checkout**.
- On checkout they enter an email; the order is saved server-side in `orders.json`.
- Admins can view all recorded orders.

## Data Storage

- `products.json` holds the master product list. The server appends new items here.
- `orders.json` stores all customer orders.

> **Note:** This backend is intended for prototyping and development. A real
> deployment should use a database and proper authentication/security.
