ARG FOO="init"
ARG AAA="init"

FROM busybox AS build1
RUN echo hello > /hello

FROM busybox AS build2
ARG FOO
ARG AAA
RUN echo hi > /hi && cat /fail

FROM scratch
COPY --from=build1 /hello /
RUN cat fail > /
COPY --from=build2 /hi /
