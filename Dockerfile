FROM node:10.6 AS base-image
MAINTAINER Alexander Sergeychik <alexander.sergeychik@gmail.com>

ENV     NODE_ENV    prod
RUN mkdir /app

COPY dist/ /app/dist/
COPY package*.json /app/
ADD .npmrc /root/.npmrc

WORKDIR /app

#RUN ls -la dist/app
RUN npm install --production

## Runner image
FROM node:10.6 AS production
MAINTAINER Alexander Sergeychik <alexander.sergeychik@gmail.com>

COPY --from=base-image /app /app
WORKDIR /app

ENV     NODE_ENV    prod

ENV     DEBUG               *
ENV     DEBUG_HIDE_DATE     1
ENV     HEARTBEAT_PERIOD    5
ENV     HANDSHAKE_TIMEOUT   10
#ENV     AWS_ACCESS_KEY_ID
#ENV     AWS_SECRET_ACCESS_KEY
#ENV     AWS_REGION us-east-2
#ENV    MESSAGE_FILTER      vin,location,telemetry,faultcodes

EXPOSE 16500
EXPOSE 16501
CMD npm run docker
