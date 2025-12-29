# Say-Less

A demo project that shows you how to create a simple AI chatbot that can:

A. Generate responses to messages
B. Generate user interfaces

# To run

1. Clone this project
2. `npm install`
3. `npm run dev`

# Setup

As you can see in `setup.jsx`, there is a variable called `VITE_FIREBASE_API_KEY`.
You will need to include an `.env` file in `/Say-Less` to define an environment variable so you
can place your key there.

This key can be found and created when you setup a simple firebase project, which we learn
about here [step-by-step-tutorial](https://www.patreon.com/posts/93082226?collection=23880).

When you create a firebase project, you'll get a configuration object that you can replace `firebaseConfig` with in the `setup.jsx` file.

Additionally, change the name to your project in the `.firebaserc` file in this project

```
{
  "projects": {
    "default": "your-project-name"
  }
}
```

Lastly, you'll need to enable Firebase AI Logic with the vertexAI product. This will allow you to run AI and all of this can be found in firebase.

Similarly, if you want to use OpenAI, Claude, etc, it's the same idea. You'll need to create an account with them, go to your developer dashboard, get an API key and connect it to your project.
