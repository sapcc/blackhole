FROM node:11.12-alpine
LABEL source_repository="https://github.com/sapcc/blackhole"

RUN apk --no-cache add git ca-certificates make

ADD . /home/app/api
WORKDIR /home/app/api

RUN yarn

ENV PGHOST=postgres
ENV PGUSER=postgres
ENV PGPASSWORD=secret
ENV PGDATABASE=blackhole_production

CMD ["yarn", "production"]
