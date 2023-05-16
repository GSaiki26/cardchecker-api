# CardChecker API
The cardchecker api is a nodeJS application created to manage checks that are sent by the cardchecker-client.
It's basically a card control application.

## Usage
This project need the `worker.proto`, that can be found in the:
[Workers API](https://github.com/GSaiki26/workers-api) repos.

It's also use TLS, so you need to create the CA certificates and the server certiticates.
To do it execute the commands above:
```sh
CA_SUBJ="/CN=ca";
SERVER_SUBJ="/CN=cardchecker-api";

mkdir certs; cd certs;
openssl req -x509 -nodes -days 365 -out ./ca.pem -newkey rsa:2048 -keyout ./ca.pem.key -subj "$CA_SUBJ";
openssl req -new -nodes -out ./server.csr -newkey rsa:2048 -keyout ./server.pem.key -subj "$SERVER_SUBJ";
openssl x509 -req -days 365 -in ./server.csr -out ./server.pem -CA ./ca.pem -CAkey ./ca.pem.key;
```
