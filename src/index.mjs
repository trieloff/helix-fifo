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

function respondJSON(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

const MAX_RESPONSE_LENGTH = 64;
const MAX_BUCKET_SIZE = 256;
export class DurableFIFOObject {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      return await this.retrieve(request);
    } else if (request.method === 'POST') {
      return await this.append(request);
    } else if (request.method === 'DELETE') {
      return await this.delete(request);
    }

    return new Response('Unknow method', {
      status: 400
    });
  }

  /**
   * Retrieves a bucket from the bucket line. If there are non-empty buckets,
   * the first non-empty bucket will be retrieved. If there are no non-empty
   * buckets, an empty response will be returned.
   * @param {string} name name of the bucket to retrieve
   * @returns {Respone} a JSON response
   */
  async getBucket(name, length) {
    const bucket = await this.state.storage.get(name) || { next: null, value: [], exhausted: true };
    if (bucket.value.length) {
      // the bucket has contents, we can use it
      return respondJSON({
        length: bucket.value.length,
        exhausted: !bucket.next,
        value: bucket.value.slice(0, length)
      });
    } else if (bucket.next) {
      // the bucket is empty, we go to the next bucket
      return this.getBucket(bucket.next);
    }
    // there is nothing else in the bucket line
    return respondJSON(bucket, 404);
  }

  async retrieve(request) {
    let length = Math.min(
      parseInt(new URL(request.url).searchParams.get('length'), 10) || MAX_RESPONSE_LENGTH,
      MAX_RESPONSE_LENGTH
    );
    const head = await this.state.storage.get("head");
    console.log(`getting head: ${head}`)
    if (!head) {
      return respondJSON({
        length: 0,
        exhausted: true,
        value: []
      }, 200);
    }
    // head points to the first bucket in the bucket line
    return this.getBucket(head, length);
  }


  async deleteEntry(head, url) {
    const bucket = await this.state.storage.get(head) || { next: null, value: [], exhausted: true };
    if (bucket.value.length) {
      const newvalues = bucket.value.filter(v => v.url !== url);
      if (newvalues.length===0) {
        // the bucket is now empty, we adjust the head pointer
        await this.state.storage.put("head", bucket.next);
        // and delete the bucket
        await this.state.storage.delete(head);
        return respondJSON({
          length: 0,
          exhausted: !bucket.next,
          value: []
        }, 202);
      } else if (newvalues.length < bucket.value.length) {
        // something has been deleted, but there is still some stuff in the bucket
        bucket.value = newvalues;
        await this.state.storage.put(head, bucket);
        return respondJSON({
          length: newvalues.length,
          exhausted: !bucket.next,
          value: []
        });
      } else if (newvalues.length === bucket.value.length && bucket.next) {
        // the value has not been found in *this* bucket, so we go to the next one
        return this.deleteEntry(bucket.next, url);
      }
      // the value does not exist at all.
      return respondJSON({
        length: 0,
        exhausted: true,
        value: [],
      }, 404);
    }
  }
  async delete(request) {
    const head = await this.state.storage.get("head");
    if (!head) {
      return respondJSON({
        length: 0,
        exhausted: true,
        value: []
      }, 201);
    }
    const { url } = request;
    return this.deleteEntry(head, url);
  }

  async appendEntry(value) {

  }

  async append(request) {
    let tail = await this.state.storage.get("tail");
    let head = await this.state.storage.get("head");
    let bucket;
    if (!tail) {
      // there is no bucket that we can append stuff to, so we create one
      bucket = {
        next: null,
        value: [],
      }
      tail = generateUUID();
    } else {
      bucket = await this.state.storage.get(tail) || { next: null, value: [] };
    }
    const body = await request.json();
    const newval = {
      url: request.url + '/' + generateUUID(),
      payload: body,
    };
    if (bucket.value.length >= MAX_BUCKET_SIZE) {
      // CloudFlare Durable Workers have a size limit of 128 KiB per value
      // we split the complete array into separate buckets, each one value
      // to circumvent this limit
      // the bucket is full, we create a new one
      const newtail = generateUUID();
      bucket.next = newtail;
      await this.state.storage.put(tail, bucket);
      bucket = {
        next: null,
        value: [ newval ],
      };
      await this.state.storage.put("tail", newtail);
      await this.state.storage.put(newtail, bucket);

      console.log(`bucket ${tail} is full, creating new bucket ${newtail}`);

      return respondJSON({
        bucket: newtail,
        length: 1,
        recent: newval,
      }, 202);
    } else {
      bucket.value.push(newval);
      await this.state.storage.put(tail, bucket);
      await this.state.storage.put("tail", tail);

      console.log(`bucket ${tail} has room, appending`);
      if (!head) {
        console.log(`setting new head ${tail}`);
        this.state.storage.put('head', tail);
      }

      return respondJSON({
        bucket: tail,
        length: bucket.value.length,
        recent: newval,
      }, 201);
    }
  }
}