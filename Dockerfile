FROM nginx:1.13.12-alpine

COPY _nginx/default.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY dist /usr/share/nginx/html

CMD [ "nginx", "-g", "daemon off;"]