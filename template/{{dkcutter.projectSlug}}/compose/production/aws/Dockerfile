FROM docker.io/amazon/aws-cli:2.36.17@sha256:a6deeaf5ec96a8f2c0d1f84e6086018ac396c95473dcec34afc275a380fa4f29

# Clear entrypoint from the base image, otherwise it's always calling the aws CLI
ENTRYPOINT []
CMD ["/bin/bash"]

COPY ./compose/production/aws/maintenance /usr/local/bin/maintenance
COPY ./compose/production/postgres/maintenance/_sourced /usr/local/bin/maintenance/_sourced

RUN chmod +x /usr/local/bin/maintenance/*

RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
  && rmdir /usr/local/bin/maintenance
