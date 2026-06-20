FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package.json backend/tsconfig.json ./
RUN npm install --frozen-lockfile
COPY backend/src/ src/
COPY backend/content/ content/
COPY shared/ /shared/
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist dist/
COPY --from=build /app/content content/
COPY --from=build /app/node_modules node_modules/
COPY --from=build /shared /shared/
COPY backend/package.json ./
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/app/src/index.js"]