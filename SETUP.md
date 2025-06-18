# Setup Guide

This guide will help you set up the ChatGPT Clone application with Groq AI integration.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed on your system
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB** database (local or cloud)
- **Groq API key** (free tier available)
- **Clerk account** for authentication
- **Uploadcare account** for file uploads

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd chatgpt-clone
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Groq AI - Fast AI inference platform
# Get your API key from: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# MongoDB - Database for chat storage
# Get your connection string from: https://www.mongodb.com/atlas
MONGODB_URI=your_mongodb_connection_string_here

# Clerk Authentication
# Get your keys from: https://clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Uploadcare - File upload and CDN service
# Get your keys from: https://uploadcare.com/
NEXT_PUBLIC_UPLOADCARE_API_KEY=your_uploadcare_public_key_here
NEXT_PUBLIC_UPLOADCARE_SECRET_KEY=your_uploadcare_secret_key_here
```

## Step 4: Get Your API Keys

### Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### MongoDB Connection String

1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Replace `<password>` with your actual password
6. Add to your `.env.local` file

### Clerk Authentication Keys

1. Visit [Clerk Dashboard](https://clerk.com/)
2. Create a new application
3. Go to API Keys section
4. Copy both publishable and secret keys
5. Add to your `.env.local` file

### Uploadcare Keys

1. Visit [Uploadcare Dashboard](https://uploadcare.com/)
2. Create a new project
3. Go to API Keys section
4. Copy both public and secret keys
5. Add to your `.env.local` file

## Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Application

1. **Sign up/Sign in** using Clerk authentication
2. **Start a chat** by typing a message
3. **Upload files** using the + button
4. **Record voice** using the microphone button
5. **Edit code** by clicking the Edit button on code blocks

## Troubleshooting

### Common Issues

**1. "GROQ_API_KEY is not defined"**

- Make sure your `.env.local` file is in the root directory
- Restart your development server after adding environment variables
- Check that the variable name is exactly `GROQ_API_KEY`

**2. "MongoDB connection failed"**

- Verify your MongoDB connection string
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your database user has the correct permissions

**3. "Clerk authentication not working"**

- Verify your Clerk keys are correct
- Make sure you've configured the correct redirect URLs in Clerk
- Check that your application is properly set up in Clerk dashboard

**4. "File upload not working"**

- Verify your Uploadcare keys are correct
- Check that your Uploadcare project is active
- Ensure you have sufficient storage quota

**5. "Groq API rate limit exceeded"**

- Groq has generous free tier limits
- Check your usage in the Groq console
- Consider upgrading if you need higher limits

### Development Tips

1. **Use the browser console** to check for errors
2. **Check the terminal** for server-side errors
3. **Verify environment variables** are loaded correctly
4. **Test API endpoints** individually using tools like Postman
5. **Monitor network requests** in browser dev tools

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Static site hosting
- **Railway** - Full-stack platform
- **DigitalOcean App Platform** - Cloud hosting
- **AWS Amplify** - AWS hosting

## Environment Variables Reference

| Variable                            | Description                   | Required | Example             |
| ----------------------------------- | ----------------------------- | -------- | ------------------- |
| `GROQ_API_KEY`                      | Groq API key for AI inference | Yes      | `gsk_...`           |
| `MONGODB_URI`                       | MongoDB connection string     | Yes      | `mongodb+srv://...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key              | Yes      | `pk_test_...`       |
| `CLERK_SECRET_KEY`                  | Clerk secret key              | Yes      | `sk_test_...`       |
| `NEXT_PUBLIC_UPLOADCARE_API_KEY`    | Uploadcare public key         | Yes      | `public_key`        |
| `NEXT_PUBLIC_UPLOADCARE_SECRET_KEY` | Uploadcare secret key         | Yes      | `secret_key`        |

## Support

If you encounter any issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [API documentation](API_DOCUMENTATION.md)
3. Check the [component documentation](COMPONENT_DOCUMENTATION.md)
4. Create an issue in the GitHub repository
5. Check the console logs for detailed error messages

## Next Steps

After successful setup:

1. **Customize the UI** - Modify colors, fonts, and layout
2. **Add features** - Implement additional functionality
3. **Optimize performance** - Add caching and optimizations
4. **Deploy to production** - Make it available to users
5. **Monitor usage** - Track API usage and performance
