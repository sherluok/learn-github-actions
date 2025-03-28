# https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/

FROM nginx:latest

COPY ./dist/ /usr/share/nginx/html/