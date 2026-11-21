FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY christiania-bryghus /usr/share/nginx/html/christiania-bryghus
COPY bryghus-hq /usr/share/nginx/html/bryghus-hq
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
