# `helix-fifo` FIFO Queues on Cloudflare Workers, using Durable Objects

## Try it

(using [HTTPIE](https://httpie.io/cli))

### List the top of the queue:

```http
http GET https://helix-fifo.rockerduck.workers.dev/myqueue --check-status
HTTP/1.1 200 OK
CF-RAY: 6f817bcf8e3f6d86-MUC
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:44:50 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=ijNwdWLMoDDuCpnXr9tcWmjztBwNHiXYT411t7bBM8C8%2Fuv7nYcntdB3I2x%2BeIntqpAbGytnmpSvtnDcaBrkgLF%2BiTVjqyb7pSIN19V5yZKex4T5EYJN9wfFmqKxw4gpqh9d28%2FTPfD0TIcEP3J3BqNfz0k%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 0,
    "value": []
}

The queue is empty.

```

### List the top of the queue, but limit the results:

```http
http GET https://helix-fifo.rockerduck.workers.dev/myqueue\?length\=10 --check-status
HTTP/1.1 200 OK
CF-RAY: 6f8180b1ec0c6d71-MUC
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:48:10 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=2Mu5alJ1CQlD%2BCi%2F54PLHG6%2FvRF4L0kRmM2ZcS9H5PAHBuJqJ9flfODP5tQMK5jV2KWtHAdZAoLsNmlhctHs3bqkVQW9jfAvL14u1XX%2BeSzNMqjz7DXQc4jhjWVAkq7b4ozX%2Be%2BZwWqwHpW410zMH4wB9mU%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 0,
    "value": []
}
```

The queue is still empty. `length` is the maximum length, you may get fewer items if the service thinks it is convenient.

### Add something to the Queue

```http
http POST https://helix-fifo.rockerduck.workers.dev/myqueue hello=world --check-status
HTTP/1.1 201 Created
CF-RAY: 6f8182e2a8c16d7a-MUC
Connection: keep-alive
Content-Length: 194
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:49:40 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=GBJAJCJNpkvSwA65B08imIeubPwCOtoF%2F%2FUOOgazCWPCJGkRdwr3xyc%2BP0f5o%2FKvvtROCE%2FcGnS%2B4IS4JHy8y2oipzq3kWJwa%2Fp2XHPG6rUZJrx%2BpaDz1fEdop0KTiaOF4BVWpAEd%2FJxgpOMW3sEpBpt5q4%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "bucket": "bd9db974-6b24-40b3-9219-84e42e95470a",
    "length": 1,
    "recent": {
        "payload": {
            "hello": "world"
        },
        "url": "https://helix-fifo.rockerduck.workers.dev/myqueue/874ae168-dcf7-4c82-b647-40eea48f2ed4"
    }
}
```

Send your payload as JSON, it will be appended to the queue.

Let's do this again, this was fun.

```http
http POST https://helix-fifo.rockerduck.workers.dev/myqueue foo=bar --check-status
HTTP/1.1 201 Created
CF-RAY: 6f818663efa76d86-MUC
Connection: keep-alive
Content-Length: 190
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:52:03 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=%2Bjn72HTu6HL3Td%2BR80QcujtT1aI3fglX5HDgmtr9x1tIhKDpjt9%2B3C0YNvahMyLUOdntGgeo%2FQqQZ3Hs4rrbKmfN412zskLouwwebthLEvwYWWM3xfkF9AtqQBhKof%2Fa6R6JVQAaAscAb2OWgvFn6e2De%2FY%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "bucket": "bd9db974-6b24-40b3-9219-84e42e95470a",
    "length": 2,
    "recent": {
        "payload": {
            "foo": "bar"
        },
        "url": "https://helix-fifo.rockerduck.workers.dev/myqueue/bdfe766e-5b22-4809-b4f4-a102b9b2aa6d"
    }
}
```

Note the changed return URL

### Get the contents of the queue, once again

```http
http GET https://helix-fifo.rockerduck.workers.dev/myqueue\?length\=10 --check-status
HTTP/1.1 200 OK
CF-RAY: 6f8188386f1d6d92-MUC
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:53:18 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=vyvPB9yC7QZEqAix7DdOmCu7VRDUp3ouz0pzZM8fBRaC1K0nFfxRe1MohonltmEiOEPqE%2BEw59bWlqu3kmm8SPwrQ6KBQkwsLmTwnesPbHAvrnt0JYTaBXpGa63kRg9K%2FZvOxtfK6MY3o5k0k6IpTrlnIXc%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Transfer-Encoding: chunked
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 2,
    "value": [
        {
            "payload": {
                "hello": "world"
            },
            "url": "https://helix-fifo.rockerduck.workers.dev/myqueue/874ae168-dcf7-4c82-b647-40eea48f2ed4"
        },
        {
            "payload": {
                "foo": "bar"
            },
            "url": "https://helix-fifo.rockerduck.workers.dev/myqueue/bdfe766e-5b22-4809-b4f4-a102b9b2aa6d"
        }
    ]
}
```

It's all there.

### Delete an entry from the queue (you do this after reading)

```http
http DELETE https://helix-fifo.rockerduck.workers.dev/myqueue/874ae168-dcf7-4c82-b647-40eea48f2ed4
HTTP/1.1 200 OK
CF-RAY: 6f818a33cb856d6e-MUC
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:54:40 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=eYBHaC4QIRq82a2HmjadeFsCrRLX8dvGSfZ%2F22AtXfQRk3HhsfxCylLeoRBY3XHOiyW1lu5y%2BesDUwSDLJZ%2B%2B13FtnZBKyWC64nDD0xF44WKLJy1itC1N20R%2BRX3hQYEQ9VTIFAaadLlQdg1eSqSv7F%2B3Fc%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 1,
    "value": []
}
```

Done & gone.

### Trust, but verify

```http
http GET https://helix-fifo.rockerduck.workers.dev/myqueue\?length\=10 --check-status
HTTP/1.1 200 OK
CF-RAY: 6f818b302bed6d83-MUC
Connection: keep-alive
Content-Encoding: gzip
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:55:20 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=y9lxtyCc2Lm5UIPVqJC1goSX7VnjTjGV9h8t6x259H9WZd%2Fcv6XF6Sst9V5mVt8PgxaEHrg3FYnxbZT90ggXVfsGKykqoYpnbIP3xlEfxoVl5IvI6YvMxS7vxTaQJdWjQKDiLUIf790lXi6Ho3RY%2B7PvE5o%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Transfer-Encoding: chunked
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 1,
    "value": [
        {
            "payload": {
                "foo": "bar"
            },
            "url": "https://helix-fifo.rockerduck.workers.dev/myqueue/bdfe766e-5b22-4809-b4f4-a102b9b2aa6d"
        }
    ]
}
```

### Clean up, so the queue is empty again

```http
http DELETE $(http GET "https://helix-fifo.rockerduck.workers.dev/myqueue?length=10" --check-status | jq -r ".value[0].url")
HTTP/1.1 202 Accepted
CF-RAY: 6f818cc1f91b6d83-MUC
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Date: Thu, 07 Apr 2022 08:56:24 GMT
Expect-CT: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
NEL: {"success_fraction":0,"report_to":"cf-nel","max_age":604800}
Report-To: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=t6qk7EugldoP3Hh2ABgxI79Hc%2BQ9JcQhInEDvc2Nbg9%2BrRnTTBeUWbg5ni2TLFWBjJAAj1XWEgCNTT%2B6yaXXNou77Uc7mFLZCUDmspwL%2F7xKfb4iXuoPPRoyr4I%2BxP0oMt%2B0xFeXXgEGY%2B1gHBh5iNI9rKw%3D"}],"group":"cf-nel","max_age":604800}
Server: cloudflare
Vary: Accept-Encoding
alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400

{
    "exhausted": true,
    "length": 0,
    "value": []
}
```
