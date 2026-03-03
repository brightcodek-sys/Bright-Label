# Bright-Label

This project is a simple static storefront. Products are defined in `products.json`; the
JavaScript code dynamically loads that file and renders the product cards on both the
homepage (trending section) and the shop page.

## Adding a product

1. Open `products.json` and add a new object to the array. Each entry must include:
   - `id` (unique number)
   - `name`, `price`, `category`, `image` URL
   - optional boolean flags: `sale`, `trending`
2. Save the file; the pages will reflect the change next time they load.

You no longer need to edit any HTML when adding products; just update the data file.