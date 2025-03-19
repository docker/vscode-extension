FROM golang:1.23.7-alpine3.21 AS builder

RUN apk add --no-cache git make

WORKDIR /workspaces/docker-language-server

RUN git clone https://github.com/docker/docker-language-server .

RUN make build

FROM mcr.microsoft.com/devcontainers/typescript-node:20

COPY --from=builder /workspaces/docker-language-server/docker-language-server* /bin/
