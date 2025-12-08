1. Project Overview
    This project is a Shopify-style multi-tenant analytics dashboard.
    Each tenant (shop owner) can:
       Register and log in
       See their own customers, products, orders and revenue
       View charts and stats on a dashboard
       All data is stored in a MySQL (RDBMS) database and separated by tenantId.
   
2. Tech Stack
    -> Frontend
         React (Create React App)
         React Router DOM
         Axios
         Bootstrap (for styling)
         Chart.js + react-chartjs-2 (for charts)
    -> Backend
         Node.js + Express
         Sequelize ORM
         MySQL (Railway DB)
         JSON Web Token (JWT) for auth
         Render (for backend deployment)
   
3. Multi-Tenant Idea (How tenants are separated)
     Each shop/user is called a Tenant.
     Tables like Customers, Products, Orders have a column: tenantId.
     When a tenant logs in, we store:
        token (JWT) in localStorage
        tenantId in localStorage
     Every backend request:
        Sends the token in the Authorization header.
        authMiddleware reads the token, finds the tenant in DB, and sets req.tenant.
     Controllers always filter by tenantId so each tenant only sees their own data.

4. Backend Flow (Step by Step)
    4.1 Auth Routes (/api/auth)
        POST /api/auth/register
           Body: { shopifyStore, email, password }
           Password is hashed with bcrypt.
           A new row is created in Tenants table.
           Response returns: { message, tenantId }
        POST /api/auth/login
           Body: { email, password }
           Finds tenant by email.
           Compares hashed password.
           If valid, creates a JWT token ({ id: tenant.id, email }).
           Returns { token, tenantId }.
   4.2 Auth Middleware
       Checks Authorization: Bearer <token> header.
       Verifies JWT using JWT_SECRET.
       Loads tenant from DB by id.
       Attaches to req.tenant (for example: req.tenant.id).
       All protected routes (/api/:tenantId/...) use this middleware.
   4.3 Customers & Products Routes
       GET /api/:tenantId/customers
          Middleware checks token.
          Controller checks if req.tenant.id === tenantId from URL.
          Returns all customers where tenantId = req.tenant.id.
       GET /api/:tenantId/products
          Same idea, but for products.
          POST /api/:tenantId/customers/dummy
          Creates some dummy customers for the logged-in tenant.
       POST /api/:tenantId/products/dummy
          Creates some dummy products for the logged-in tenant.
       These dummy routes are used by buttons in the frontend to quickly generate sample data.

5. Frontend Flow (Step by Step)
   5.1 Login & Register Pages
       Register
          Uses api.post('/auth/register', { email, password, shopifyStore }).
          On success, shows a message and redirects to /login.
       Login
          Uses api.post('/auth/login', { email, password }).
          On success, saves:
              token in localStorage
              tenantId in localStorage
          Navigates to /dashboard/:tenantId.
   5.2 API Service (src/services/api.js)
        axios instance with:
             baseURL: "https://shopify-backend-4ptj.onrender.com/api"
        A request interceptor automatically adds Authorization: Bearer <token> if present.
   5.3 Routing (App.js)
       Public routes:
            /login
            /register
       Protected routes are wrapped with RequireAuth:
            /dashboard/:tenantId
            /customers/:tenantId
            /products/:tenantId
            /orders/:tenantId
            /profile/:tenantId
       RequireAuth:
            If token is missing → redirect to /login
            If token exists → render the Layout with NavBar + page content.
   5.4 NavBar
       Shows links like:
           Dashboard → /dashboard/{tenantId}
           Customers → /customers/{tenantId}
           Products → /products/{tenantId}
           Orders → /orders/{tenantId}
           Profile → /profile/{tenantId}
           Logout clears token and tenantId from localStorage and redirects to /login.
  5.5 Customers Page
      Gets tenantId from URL (useParams()).
          On mount, calls:
              api.get(`/${tenantId}/customers`)
              Data is displayed in a table (S.No, Name, Email, Spent).
          Has a “Create Dummy Customers” button:
              api.post(`/${tenantId}/customers/dummy`)
              This calls the backend route to insert sample customers for that tenant, then reloads the page.
  5.6 Products Page
       Similar to Customers page.
       Fetches:
          api.get(`/${tenantId}/products`)
          Displays title and price.
       Has a “Create Dummy Products” button:
          api.post(`/${tenantId}/products/dummy`)
          which creates default products for that tenant.
   5.7 Dashboard Page
        Uses multiple backend APIs like:
            GET /:tenantId/overview → counts of customers, orders, revenue.
            GET /:tenantId/revenue?from=...&to=... → data for line chart.
            GET /:tenantId/top-customers?limit=5 → top customers list.
       Shows:
            3 top cards: total customers, total orders, total revenue.
            Line chart for last 30 days revenue (using Chart.js).
            List of top customers with amount spent.
6. How to Run the Project Locally
    6.1 Backend (Node + Express)
         Go to backend folder:
            cd backend
        Install dependencies:
            npm install
        Create a .env file with:
           DB_HOST=your_mysql_host
           DB_USER=your_mysql_user
           DB_PASS=your_mysql_password
           DB_NAME=your_db_name
           DB_PORT=your_db_port
           JWT_SECRET=some-secret-key
           PORT=5000
        Start backend:
           npm start
   6.2 Frontend (React)
        Go to frontend folder:
            cd frontend
        Install dependencies:
            npm install
            (Optional) Set REACT_APP_API_URL if needed, otherwise it uses default backend URL.
        Start frontend:
            npm start
        Open browser:
            http://localhost:3000
7. Deployment Summary
       Backend deployed on Render (Node + Express service).
       Database hosted on Railway (MySQL).
       Frontend deployed on Vercel.
       axios baseURL points to the deployed backend API URL.
