const inspect = Symbol.for('nodejs.util.inspect.custom');

/**
 * Response class.
 * The response object passed on to middleware, actions and routes.
 */
export default class HResponse {
  /**
   * @constructor
   *
   * Response class.
   * The response object passed on to middleware, actions and routes.
   *
   * @example
   * ```
   * const response = new Response();
   * ```
   */

  #location;
  #headers;
  #context;
  #status;
  #type;

  constructor() {
    this.#location;
    this.#headers = new Headers();
    this.#context = {};
    this.#status = 200;
    this.#type = 'text/html; charset=utf-8';
  }

  get location() {
    return this.#location;
  }

  set location(value) {
    if (value instanceof URL) {
      this.#location = value;
    } else {
      throw TypeError('Value must be of type URL');
    }

    if (this.#status <= 300 || this.#status >= 399) {
      this.#status = 303;
    }
  }

  get headers() {
    return this.#headers;
  }

  set headers(value) {
    if (value instanceof Headers) {
      this.#headers = value;
    } else {
      throw TypeError('Value must be of type Headers');
    }
  }

  get context() {
    return this.#context;
  }

  set context(value) {
    this.#context = value;
  }

  get status() {
    return this.#status;
  }

  set status(value) {
    if (!Number.isInteger(value)) {
      throw TypeError('Value must be a integer');
    }

    if (value >= 400 && value <= 599) {
      throw Error('For sending 4xx or 5xx HTTP errors, throw a HttpError instead');
    }

    if (value >= 200 && value <= 399) {
      this.#status = value;
    } else {
      throw Error('Value must be a legal 2xx or 3xx HTTP status code');
    }
  }

  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = value;
  }

  toJSON() {
    return {
      location: this.location,
      headers: this.headers,
      context: this.context,
      status: this.status,
      type: this.type,
    };
  }

  [inspect]() {
    return {
      location: this.location,
      headers: this.headers,
      context: this.context,
      status: this.status,
      type: this.type,
    };
  }

  get [Symbol.toStringTag]() {
    return 'HubroResponse';
  }
}
