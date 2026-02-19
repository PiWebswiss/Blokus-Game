FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY index.html ./index.html
COPY src ./src
COPY image ./image

EXPOSE 80
