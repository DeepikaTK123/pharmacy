

# Stage 2: Serve app with nginx server
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the SSL certificates
COPY ssl/e822a21acfa412f0.crt /etc/nginx/ssl/e822a21acfa412f0.crt
COPY ssl/gd_bundle-g2-g1.crt /etc/nginx/ssl/gd_bundle-g2-g1.crt
COPY ssl/e822a21acfa412f0.pem /etc/nginx/ssl/e822a21acfa412f0.pem

# Copy the build folder to the Nginx HTML directory
COPY --from=build /usr/local/app/build /usr/share/nginx/html

# Expose port 80 and 443 to the outside world
EXPOSE 80
EXPOSE 443

# Start Nginx when the container has provisioned
CMD ["nginx", "-g", "daemon off;"]
