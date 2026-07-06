FROM docker.io/traefik:v3.7.6@sha256:21a3d83696379bac6434bb32e1dde0aff0e84ef2abd053ed3db87d3f45e749b2
RUN mkdir -p /etc/traefik/acme \
  && touch /etc/traefik/acme/acme.json \
  && chmod 600 /etc/traefik/acme/acme.json
COPY ./compose/production/traefik/traefik.yml /etc/traefik
