FROM mcr.microsoft.com/playwright:v1.51.1-noble

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npx playwright install
RUN npx playwright install-deps

COPY . .

RUN npm run build

ENTRYPOINT ["node", "dist/main.js"]
CMD []