## check versions
node -v
npm -v

## Install Dependencies
npm install

(optional) set OpenAPI key for better explanations
$env:OPENAI_API_KEY="YOUR_KEY_HERE"

## Run
$env:PORT="5001"
$env:NODE_ENV="development"
npx tsx server/index.ts

## Build and Run with Docker

To build the Docker image, run the following command:

```bash
docker build -t subsense-ai .
```

To run the Docker container, run the following command:

```bash
docker run -p 5001:5001 subsense-ai
```

## Deploy to Fly.io

To deploy the application to Fly.io, you will need to have the `flyctl` CLI installed. You can find instructions on how to install it [here](https://fly.io/docs/hands-on/install-flyctl/).

Once you have the `flyctl` CLI installed, you can deploy the application by running the following commands:

```bash
fly launch
fly deploy
```