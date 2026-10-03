FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV DATA_DIR=/app/data
EXPOSE 3000
# PORT diatur otomatis oleh layanan hosting (Railway/Render); server memakai 3000 bila tidak ada.
CMD ["node", "server.js"]
