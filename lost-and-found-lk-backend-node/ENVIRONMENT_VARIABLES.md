# Required Environment Variables for Vercel

Add the following variables in your Vercel Dashboard under **Settings** -> **Environment Variables**.

## 1. MONGODB_URI (Critical)
This is the connection string to your database.
> **Value:** `mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority&tls=true`

*Note: The above value is taken from your previous default configuration. Ensure the username/password and cluster details are correct and that your MongoDB Atlas "Network Access" allows connections from `0.0.0.0/0`.*

## 2. JWT_SECRET (Critical)
Used for securing user sessions.
> **Value:** `5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437`

## 3. APP_CORS_ALLOWEDORIGINS (Optional)
Controls which sites can access your API.
> **Value:** `https://lost-found-site.vercel.app,http://localhost:5173`

## 4. JWT_ACCESS_TTL (Optional)
> **Value:** `15m`

## 5. JWT_REFRESH_TTL (Optional)
> **Value:** `7d`
