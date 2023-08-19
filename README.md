# Ecom-Api

Welcome to the documentation for Ecom-Api! Below you'll find information about the API endpoints, how to authenticate, and how to interact with the different routes.

## API Documentation

## Swagger API Documentation

You can explore the API documentation interactively using Swagger UI. Simply visit `/api/docs` in your browser to access the Swagger documentation.

## Usage

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file in the root directory and add the following keys:
    mongo_uri=your_mongo_uri
    jwt_secret=your_secret_jwt_token
   Replace `your_mongo_uri` with your actual MongoDB connection URI and `your_secret_jwt_token` with your desired JWT secret.
5. Start the server using `node server.js`.

### User Registration

- Route: `POST /api/users/register`
- Summary: Register a new user.
- Inputs: `{ name, email, password }`

### User Login

- Route: `POST /api/users/login`
- Summary: Authenticate a user and generate a token.
- Inputs: `{ email, password }`

### Get Logged In User

- Route: `GET /api/users/me`
- Summary: Get authenticated user's details.
- Authorization: Bearer token required in headers.

## How to Authenticate

To access authenticated routes, you need to include a valid JWT (JSON Web Token) in the headers of your requests.

Example: Authorization : Bearer {your_token_here}
Add Authorization in headers with value Bearer {your_token_here}. Place token in your_token_here. There should be space beteen Bearer and token

### Categories

#### Get Categories

- Route: `GET /api/categories`
- Summary: Get a list of all categories.

#### Create Category

- Route: `POST /api/categories`
- Summary: Create a new category.
- Inputs: `{ name }`

### Cart

#### Add Product to Cart

- Route: `POST /api/cart/:productId`
- Summary: Add a product to the cart.
- Authorization: Bearer token required in headers.
- Params: `productId` (Valid product ID)

#### View Cart

- Route: `GET /api/cart`
- Summary: View the user's cart.
- Authorization: Bearer token required in headers.

#### Update Product Quantity in Cart

- Route: `PUT /api/cart/:productId`
- Summary: Update the quantity of a product in the cart.
- Authorization: Bearer token required in headers.
- Params: `productId` (Valid product ID)
- Inputs: `{ quantity }`

#### Remove Product from Cart

- Route: `DELETE /api/cart/:productId`
- Summary: Remove a product from the cart.
- Authorization: Bearer token required in headers.
- Params: `productId` (Valid product ID)

### Orders

#### Place Order

- Route: `POST /api/orders`
- Summary: Place an order from the user's cart.
- Authorization: Bearer token required in headers.

#### Order History

- Route: `GET /api/orders/history`
- Summary: View the user's order history.
- Authorization: Bearer token required in headers.

#### Order Details

- Route: `GET /api/orders/:orderId`
- Summary: View details of a specific order.
- Authorization: Bearer token required in headers.
- Params: `orderId` (Valid order ID)

### Products

#### Get Products by Category

- Route: `GET /api/products/category/:categoryId`
- Summary: Get products based on category ID.
- Params: `categoryId` (Valid category ID)

#### Create Product

- Route: `POST /api/products`
- Summary: Create a new product.
- Inputs: `{ name, price, description, quantity, categoryId }`

#### Get Product Details

- Route: `GET /api/products/:productId`
- Summary: Get details of a specific product.
- Params: `productId` (Valid product ID)
