FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY christiania-bryghus /usr/share/nginx/html/christiania-bryghus
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
