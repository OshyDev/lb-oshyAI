# Oshy for LB Phone

A simple chat assistant for FiveM's LB Phone. Oshy supports OpenAI and Groq through a server-side HTTP request, so the API key stays on the server.

## Setup

1. From the `ui` folder, run `npm install` and `npm run build`.
2. Add the resource to your FiveM server and make sure `lb-phone` starts first.
3. Choose a provider and add its API key to `server.cfg` before starting this resource:

```cfg
set oshy_ai_provider "openai" # or "groq"
set oshy_ai_api_key "YOUR_API_KEY"
# Optional: choose a different chat completion model
# set oshy_ai_model "gpt-4o-mini"
ensure lb-phone
ensure lb-phone-oshy-ai
```

Groq uses `llama-3.3-70b-versatile` by default. OpenAI uses `gpt-4o-mini`. Set `oshy_ai_model` to use another model available from your provider.

For local development, switch the UI URL in `client.lua` to `http://localhost:3000` and run `npm run dev` from `ui`. The browser preview returns a sample response without calling an API.
