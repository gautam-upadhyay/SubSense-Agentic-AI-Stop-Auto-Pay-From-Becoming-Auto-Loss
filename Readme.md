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