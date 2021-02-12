# Heimdall

> I watch over you always, even when you think you are alone in this world

Heimdall is a single binary [Loki](https://github.com/grafana/loki) watcher for alerting on queried log lines.
Currently, we have support built in for these alert types:

- Telegram
- Email

## Config

Heimdall has a global configuration file, **config.yaml**, which defines several aspects of its operation:

- **loki** section of config consists of **host** and **port** variables and defines loki server endpont
  - host - The host name of the Loki instance . Example: http://127.0.0.1
  - port -  The port corresponding to host. Example 3100
- **poll** section defines loki polling interval and loki query labels
  - every - How often Heimdall should query Loki. Heimdall will remember the last time it ran the given query, and periodically query from that time until the present. The format of this field is a timestring like **5m, 10m** (minutes only!).
  - label - Is a yaml array of loki labels and values, formatted like **label:value**. For each array value heimdall will build string for loki queryng. EX: **level:error** will look like level="error". Heimdall can only querying by lables at this moment!
- **alert** section defines a list of alerts to run on each query match
  - **telegram** initialize telegram alerter module
    - botToken - telegram bot token is a string, that will be required to authorize the bot and send requests to the Telegram Bot API. You can learn about obtaining tokens and generating new ones in this [document](https://core.telegram.org/bots#botfather).
    - chatId - unique identifier for the target telegram chat.
  - **webhook** initialize webhook alerter module
    - webhookUrl - target url for webhooks sending.
    - headers - is a yaml array of headers, which will send with webhooks. Formatted like **header:'value'**.
  - **email** initialize email alerter module
    - host - smtp host of your mail server
    - secure - connect the SMTP host using TLS
    - *auth* defines smtp server authentication
      - user - smtp server username
      - pass - smtp server password
    - *message* defines sending email parameters
      - from - sets the From header in the email
      - to - email recipient

## Config Example

```yaml
loki: 
  host: 'http://172.17.17.14'
  port: 32769
poll:
  every: 5m
  label:
    - job:api
    - level:error
alert:
  telegram:
    botToken: '1394072***:XXXxXXx5xXxxXxxxXx4XXXXx8x1XxXxXxX0'
    chatId: '217459***'
  webhook:
    webhookUrl: 'http://webhook123.url/endpoint'
    headers:
      - Authentication:'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
      - Header2:'Value2'
  email:
    host: smtp.mailserver.io
    secure: true
    auth: 
      user: someuser@domain.com
      pass: secretpassword
    message:
      from: anotheruser@domain.com
      to: another2user@domain.com
```

You can use only alerters you need by not defining them. Ex:

```yaml
loki: 
  host: 'http://172.17.17.14'
  port: 32769
poll:
  every: 5m
  label:
    - job:api
    - level:error
alert:
  telegram:
    botToken: '1394072***:XXXxXXx5xXxxXxxxXx4XXXXx8x1XxXxXxX0'
    chatId: '217459***'
```

## Templating

Heimdall supports simple templating of json log lines. Just define **templateString** variable in the alert section of your config.
This is a string variable with current format: 'some text {parcedJsonField1}, another text {parcedJsonField2}'
Perhaps, your log line is a json:

```json
{"job":"api", "level":"error", "message":"ECONNREFUSED"}
```

by defining something like this

```yaml
alert:
  templateString: 'ALARM! {job} got an {level} with message: {message}'
```

in your config.yaml file, your alert string will looks like: **ALARM! api got an error with message: ECONNREFUSED**

## Running Heimdall

Just start a single binary (depends on your platform) like

```bash
heimdall-linux-x64 --path /path/to/config.yaml
```

You can use *-p* instead of *\-\-path*
