FROM node:11.12-alpine

RUN apk --no-cache add git ca-certificates make

ADD . /home/app/api
WORKDIR /home/app/api

RUN yarn

ENV PGHOST=${BLACKHOLE_POSTGRESQL_SERVICE_HOST:-postgres}
ENV PGUSER=${POSTGRES_USER:-postgres}
ENV PGPASSWORD=$BLACKHOLE_DB_PASSWORD
ENV PGDATABASE=${BLACKHOLE_POSTGRES_DB:-blackhole_production}

CMD ["yarn production"]
