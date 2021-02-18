# Heimdall

> I watch over you always, even when you think you are alone in this world

Heimdall is a single binary [Loki](https://github.com/grafana/loki) watcher for alerting on queried log lines.
Currently, we have support built in for these alert types:

- Telegram
- Email
- Slack
- Webhooks

## Table of Contents

1. [Config](#config)
2. [Config Example](#config-example)
3. [Running Heimdall](#running-heimdall)
4. [Templating](#templating)
5. [Aggregation](#aggregation)
6. [Webhook Body](#webhook-body)

## Config

Heimdall has a global configuration file, **config.yaml**, which defines several aspects of its operation:

- **loki** section of config consists of **host** and **port** variables and defines loki server endpont (REQUIRED)
  - host - The host name of the Loki instance . Example: http://127.0.0.1 (REQUIRED)
  - port -  The port corresponding to host. Example 3100 (REQUIRED)
- **poll** section defines loki polling interval and loki query labels (REQUIRED)
  - every - How often Heimdall should query Loki. Heimdall will remember the last time it ran the given query, and periodically query from that time until the present. The format of this field is a timestring like **5m, 10m** (minutes only!). (REQUIRED)
  - label - Is a yaml array of loki labels and values, formatted like **label:value**. For each array value heimdall will build string for loki queryng. EX: **level:error** will look like level="error". Heimdall can only querying by labels at this moment! (REQUIRED)
- **aggregation** section defines aggregation mode
  - key - label for grouping matches (REQUIRED IF AGGREGATION DEFINED)
  - limit - limit of matches in one group
  - timeFrame -  aggregation period. (format of this field is a timestring like **5m, 10m** (minutes only!)) (REQUIRED IF AGGREGATION DEFINED)
- **alert** section defines a list of alerts to run on each query match
  - **telegram** initialize telegram alerter module
    - botToken - telegram bot token is a string, that will be required to authorize the bot and send requests to the Telegram Bot API. You can learn about obtaining tokens and generating new ones in this [document](https://core.telegram.org/bots#botfather). (REQUIRED IF TELEGRAM DEFINED)
    - chatId - unique identifier for the target telegram chat. (REQUIRED IF TELEGRAM DEFINED)
  - **slack** initialize slack alerter module, alerter will send a notification to a predefined (by url) channel
    - webhookUrl - slack webhook url. You can obtain it on <https://XXXXX.slack.com/services/new/incoming-webhook>, choose the channel, click ‘Add Incoming Webhooks Integration’ and copy the resulting URL. (REQUIRED IF SLACK DEFINED)
  - **webhook** initialize webhook alerter module.
    - url - target url for webhooks sending. (POST method with Application/Json Content-Type) (REQUIRED IF WEBHOOK DEFINED)
    - headers - is an array of headers which will be send with webhooks. Array of **header:value** strings.
  - **email** initialize email alerter module
    - host - smtp host of your mail server (REQUIRED IF EMAIL DEFINED)
    - secure - connect the SMTP host using TLS
    - *auth* defines smtp server authentication (REQUIRED IF EMAIL DEFINED)
      - user - smtp server username (REQUIRED IF EMAIL DEFINED)
      - pass - smtp server password (REQUIRED IF EMAIL DEFINED)
    - *message* defines sending email parameters (REQUIRED IF EMAIL DEFINED)
      - from - sets the From header in the email (REQUIRED IF EMAIL DEFINED)
      - to - email recipient (REQUIRED IF EMAIL DEFINED)

## Config Example

This example shows how to config any section of sections listed above. It's not necessary to use them all.

```yaml
loki: 
  host: 'http://172.17.17.14'
  port: 32769
poll:
  every: 5m
  label:
    - job:api
    - level:error
aggregation:
    key: message
    limit: 100
    timeFrame: 5m
alert:
  telegram:
    botToken: '1394072***:XXXxXXx5xXxxXxxxXx4XXXXx8x1XxXxXxX0'
    chatId: '217459***'
  slack:
    webhookUrl: https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
  webhook:
    url: 'http://webhook123.url/endpoint'
    headers:
      - Authentication:Basic YWxhZGRpbjpvcGVuc2VzYW1l
      - Header2:Value2
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

## Running Heimdall

Just start a single binary (depends on your platform) like

```bash
heimdall-linux-x64 --path /path/to/config.yaml
```

You can use *-p* instead of *\-\-path*

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

## Aggregation

Heimdall supports simple aggregation feature. If you set up an aggregation section of your config, heimdall will aggregate matches by given aggregation key and send them every aggregation timeframe. Some example.

Suppose we are sets up this config:

```yaml
aggregation:
  key: label
  limit: 10
  timeFrame: 5m
```

And we got some json log lines

```json
{"label":"SERVICE_ERR", "level":"error", "message": "some error message"}
{"label":"SERVICE_ERR", "level":"error", "message": "some error message"}
{"label":"EXTERNAL_ERR", "level":"error", "message": "some error message"}
```

Heimdall will send this message in 5 minutes:

```text
From: <date time utc string>
To: <date time uts string>
SERVICE_ERR #2
EXTERNAL_ERR #1
```

**\#number** defines amount of aggregated matches by key

If aggregated matches had reached limit param, heimdall would send message immediately

## Webhook Body

Body of webhook is an object with only one field **result**, which contains revised result array of loki [query_range](https://grafana.com/docs/loki/latest/api/#get-lokiapiv1query_range) request. But all \<stream value\>'s values concatenated and sorted by time (nanoseconds from [0] element of values). Example:

```json
{
  "result": [
    [
      "1613557491201802037",
      "{\"message\":\"something5\",\"level\":\"info\",\"service\":\"user-service\"}"
    ],
    [
      "1613557491952212928",
      "{\"message\":\"something5\",\"level\":\"info\",\"service\":\"user-service\"}"
    ],
    [
      "1613557492702503317",
      "{\"message\":\"something5\",\"level\":\"info\",\"service\":\"user-service\"}"
    ],
    [
      "1613557493202724043",
      "{\"message\":\"something5\",\"level\":\"info\",\"service\":\"user-service\"}"
    ],
    [
      "1613557493953153936",
      "{\"message\":\"something5\",\"level\":\"info\",\"service\":\"user-service\"}"
    ]
  ]
}
```
