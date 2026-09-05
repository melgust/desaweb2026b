# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build -- --configuration production

# Serving Stage
FROM nginx:alpine
COPY --from=build /app/dist/enterprise-frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx para SPA (Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]