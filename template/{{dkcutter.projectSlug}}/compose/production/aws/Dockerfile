FROM docker.io/amazon/aws-cli:2.35.4@sha256:0086abfb91b5f0f2add8740d041a71535ddbe1cd8316d5e89b7066c84db920e7

# Clear entrypoint from the base image, otherwise it's always calling the aws CLI
ENTRYPOINT []
CMD ["/bin/bash"]

COPY ./compose/production/aws/maintenance /usr/local/bin/maintenance
COPY ./compose/production/postgres/maintenance/_sourced /usr/local/bin/maintenance/_sourced

RUN chmod +x /usr/local/bin/maintenance/*

RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
  && rmdir /usr/local/bin/maintenance
