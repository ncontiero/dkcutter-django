FROM docker.io/amazon/aws-cli:2.37.1@sha256:b0dd5a4d216a1786863541a201baa7b7b4c5032bec9c6e72c38d01cafd7e8db8

# Clear entrypoint from the base image, otherwise it's always calling the aws CLI
ENTRYPOINT []
CMD ["/bin/bash"]

COPY ./compose/production/aws/maintenance /usr/local/bin/maintenance
COPY ./compose/production/postgres/maintenance/_sourced /usr/local/bin/maintenance/_sourced

RUN chmod +x /usr/local/bin/maintenance/*

RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
  && rmdir /usr/local/bin/maintenance
