FROM golang:1.23.7-alpine3.21 AS builder

RUN apk add --no-cache git make

WORKDIR /workspaces/docker-language-server

RUN git clone https://github.com/docker/docker-language-server .

RUN make build

FROM mcr.microsoft.com/devcontainers/typescript-node:20

COPY --from=builder /workspaces/docker-language-server/docker-language-server* /usr/local/bin/

RUN apt-get update && apt-get install -y ca-certificates curl
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
  chmod a+r /etc/apt/keyrings/docker.asc
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update
RUN apt-get install docker-ce-cli docker-buildx-plugin docker-compose-plugin