export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  }
};

async function handleRequest(request, env) {
  const [_, queue] = new URL(request.url).pathname.split('/');

  let id = env.FIFO.idFromName(queue);
  let obj = env.FIFO.get(id);
  let resp = await obj.fetch(request.url, {
    method: request.method,
    body: request.body,
  });

  return resp;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class DurableFIFOObject {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      let length = Math.min(
        parseInt(new URL(request.url).searchParams.get('length'), 10),
        10
      );
      let value = await this.state.storage.get("value") || [];
      return new Response(JSON.stringify({
        length: value.length,
        value: value.slice(0, length)
      }),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    } else if (request.method === 'POST') {
      let value = await this.state.storage.get("value") || [];

      let body = await request.json();
      const newval = {
        url: request.url + '/' + generateUUID(),
        payload: body,
      };
      value.push(newval);
      await this.state.storage.put("value", value);
      return new Response(JSON.stringify({ length: value.length, status: 'ok', recent: newval }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (request.method === 'DELETE') {
      let value = await this.state.storage.get("value") || [];
      let newvalue = value.filter(v => v.url !== request.url);
      await this.state.storage.put("value", newvalue);
      return new Response(JSON.stringify({
        length: newvalue.length,
        status: value.length === newvalue.length ? 'not found' : 'deleted'
      }), {
        headers: {
          'content-type': 'application/json'
        }
      });
    }

    return new Response('Unknow method', {
      status: 400
    });
  }
}