# FriendAI

FriendAI is a Next.js-based AI companion web app that provides a modern UI/UX, authentication, and deployment best practices. It allows users to chat and call with an AI friend, ensuring a seamless and engaging experience.We’re working on bringing you high-quality voice calls with AI. Stay tuned for this exciting feature!

## Features

- **Modern UI/UX**: Built with shadcn/ui, Tailwind CSS, and TypeScript.
- **Authentication**: Integrated with Clerk for secure user authentication.
- **Chat and Call Features**: Users can send messages and make calls with the AI companion.
- **Responsive Design**: Ensures a great experience on all devices.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/FriendAI.git
   cd FriendAI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your Clerk API keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Usage

- **Home Page**: Displays the hero section with options to sign in or create an account.
- **Chat Page**: Accessible to signed-in users, allowing them to send messages to the AI.
- **Call Page**: Accessible to signed-in users, providing a coming soon message for voice calls.We’re working on bringing you high-quality voice calls with AI. Stay tuned for this exciting feature!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

# FriendAi-BE
