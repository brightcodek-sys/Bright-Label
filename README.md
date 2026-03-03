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

- Go to `/admin.html` and log in with the admin password. The password is verified
  by the server and returns a short-lived JWT; the default password is **505060**.
  To change the password, set the `ADMIN_PASSWORD_HASH` environment variable to the
  bcrypt hash of your desired password. You can also change `JWT_SECRET` to rotate the
  signing key. Both values should be stored in a `.env` file or exported in your
  deployment environment.
- Add products through the form (including image upload). They will immediately appear on
the shop for all users; adding, deleting, and viewing orders require a valid token.
- Delete products or review customer orders from the admin interface. Use the
  **Logout** button to clear your session.

### Shopping Workflow

- Customers browse `/shop.html`, add items to cart and click **Checkout**.
- On checkout they enter an email; the order is saved server-side in `orders.json`.
- Admins can view all recorded orders.

## Data Storage

- `products.json` holds the master product list. The server appends new items here.
- `orders.json` stores all customer orders.

> **Note:** This backend is intended for prototyping and development. A real
> deployment should use a database and proper authentication/security.
