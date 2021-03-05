FROM node:14.15-alpine

RUN rm -rf /simulation/

RUN mkdir -p /simulation/dist

COPY ./dist ./dist

COPY ./package.json .

RUN npm cache clean --force

RUN npm install --production

CMD ["npm", "run", "watch"]