# Preview-environment shim: supervisor runs this FastAPI app on :8001; it boots the Express API (/app/server) and proxies /api to it.
import os
import socket
import subprocess

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response

UPSTREAM = "http://127.0.0.1:5000"
HOP = {"host", "content-length", "connection", "transfer-encoding", "keep-alive", "upgrade"}
DROP_RESP = {"content-length", "content-encoding", "transfer-encoding", "connection"}

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
client = httpx.AsyncClient(base_url=UPSTREAM, timeout=120)


def express_up():
    try:
        socket.create_connection(("127.0.0.1", 5000), 0.5).close()
        return True
    except OSError:
        return False


@app.on_event("startup")
async def boot_express():
    if not express_up():
        log = open("/var/log/supervisor/express.log", "a")
        subprocess.Popen(["bash", "/app/server/scripts/preview-start.sh"], stdout=log, stderr=subprocess.STDOUT, start_new_session=True, env=os.environ.copy())


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    headers = [(k, v) for k, v in request.headers.items() if k.lower() not in HOP]
    headers.append(("host", request.headers.get("host", "")))
    url = httpx.URL(path="/" + path, query=request.url.query.encode())
    try:
        upstream = await client.request(request.method, url, headers=headers, content=await request.body())
    except httpx.ConnectError:
        return Response('{"error":{"message":"API server is starting, retry shortly"}}', status_code=503, media_type="application/json")
    resp = Response(content=upstream.content, status_code=upstream.status_code)
    for k, v in upstream.headers.multi_items():
        if k.lower() not in DROP_RESP:
            resp.headers.append(k, v)
    return resp
