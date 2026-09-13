FROM docker.io/amazon/aws-cli:2.36.42@sha256:f88a264623a4e6700f226ec3f90b902b1a4010810fce1edade1f269a7c071052

# Clear entrypoint from the base image, otherwise it's always calling the aws CLI
ENTRYPOINT []
CMD ["/bin/bash"]

COPY ./compose/production/aws/maintenance /usr/local/bin/maintenance
COPY ./compose/production/postgres/maintenance/_sourced /usr/local/bin/maintenance/_sourced

RUN chmod +x /usr/local/bin/maintenance/*

RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
  && rmdir /usr/local/bin/maintenance
