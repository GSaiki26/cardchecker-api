# CardChecker API

[![Code quality](https://github.com/GSaiki26/cardchecker-api/actions/workflows/quality.yaml/badge.svg)](https://github.com/GSaiki26/cardchecker-api/actions/workflows/quality.yaml) [![Docker Build](https://github.com/GSaiki26/cardchecker-api/actions/workflows/build.yaml/badge.svg)](https://github.com/GSaiki26/cardchecker-api/actions/workflows/build.yaml) [![Security](https://github.com/GSaiki26/cardchecker-api/actions/workflows/security.yaml/badge.svg)](https://github.com/GSaiki26/cardchecker-api/actions/workflows/security.yaml)

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

## Env file

This project uses 2 envs file: 1 to the Postgres Database and 1 to the API.
The database's env just uses a `POSTGRES_USER` and a `POSTGRES_PASSWORD`.
Otherwise, the API uses these envs:

|      Name      | Description                                                                                                                                                                                                                       |
| :------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MULTI_CLUSTER | Set to `enable` if you want to use multi processes in your project.                                                                                                                                                             |
|    MAIL_CC    | This field is used to define the CC from the mail.                                                                                                                                                                                |
|   MAIL_USER   | This field is used to define the email owner.                                                                                                                                                                                     |
|   MAIL_PASS   | This field is used to define the password from the email. If using google mail, checkout this doc:[Google Apps Passwords](https://support.google.com/accounts/answer/185833?hl=en).                                                  |
|   MASTER_KEY   | This field is used to define the masterkey. By default, all the incoming requests are readen with normal previleges since all they have a certificate signed by the CA. But some features use a higher permission.                |
| WORKER_API_URI | Default: "worker-api:3000". This field is used to define the uri to the `worker-api`. You need to setup this api in order to use this application. You can clone this repos: [worker-api](https://github.com/GSaiki26/worker-api). |
