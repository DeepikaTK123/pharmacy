# Stage 1: Compile and Build React codebase
# FROM node:20 AS build

# WORKDIR /usr/local/app

# COPY ./ /usr/local/app/

# RUN npm install

# CMD ["npm", "start"]


# Stage 2: Serve app with nginx server
# FROM nginx:1.21-alpine

# COPY --from=build /usr/local/app/build /usr/share/nginx/html

# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

# Use the official Nginx image as the base image
# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build folder to the Nginx HTML directory
COPY build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container has provisioned
CMD ["nginx", "-g", "daemon off;"]
