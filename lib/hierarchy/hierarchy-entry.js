const inspect = Symbol.for('nodejs.util.inspect.custom');

/**
 * HierarchyEntry class.
 * Holds all the stuff which goes into the head the document.
 */
export default class HierarchyEntry {
  /**
   * @constructor
   *
   * HierarchyEntry class.
   * Holds all the stuff which goes into the head the document.
   *
   * @example
   * ```
   * const entry = new HierarchyEntry();
   *
   * ```
   */

  #uriMiddleware;
  #uriClient;
  #uriAction;
  #uriRoute;
  #uriPage;

  #bundle;
  #route;
  #hash;

  constructor(hash, route) {
    this.#uriMiddleware = '';
    this.#uriClient = '';
    this.#uriAction = '';
    this.#uriRoute = '';
    this.#uriPage = '';

    this.#bundle = false;
    this.#route = route;
    this.#hash = hash;
  }

  set uriMiddleware(value) {
    this.#uriMiddleware = value;
  }

  get uriMiddleware() {
    return this.#uriMiddleware;
  }

  set uriClient(value) {
    this.#uriClient = value;
    this.#bundle = true;
  }

  get uriClient() {
    return this.#uriClient;
  }

  set uriAction(value) {
    this.#uriAction = value;
  }

  get uriAction() {
    return this.#uriAction;
  }

  set uriRoute(value) {
    this.#uriRoute = value;
  }

  get uriRoute() {
    return this.#uriRoute;
  }

  set uriPage(value) {
    this.#uriPage = value;
  }

  get uriPage() {
    return this.#uriPage;
  }

  /**
   * @throws {Error} Read only-property
   */
  set bundle(value) {
    throw new Error('Cannot set read-only property.');
  }

  get bundle() {
    return this.#bundle;
  }

  /**
   * @throws {Error} Read only-property
   */
  set route(value) {
    throw new Error('Cannot set read-only property.');
  }

  get route() {
    return this.#route;
  }

  /**
   * @throws {Error} Read only-property
   */
  set hash(value) {
    throw new Error('Cannot set read-only property.');
  }

  get hash() {
    return this.#hash;
  }

  /**
   * @throws {Error} Read only-property
   */
  set type(value) {
    throw new Error('Cannot set read-only property.');
  }

  get type() {
    if (this.uriRoute !== '') {
      return 'api';
    }

    if (this.uriAction !== '') {
      return 'page';
    }

    if (this.uriPage !== '') {
      return 'page';
    }

    return 'client';
  }

  toJSON() {
    return {
      uriClient: this.uriClient,
      uriAction: this.uriAction,
      uriRoute: this.uriRoute,
      uriPage: this.uriPage,
      bundle: this.bundle,
      route: this.route,
      hash: this.hash,
      type: this.type,
    };
  }

  [inspect]() {
    return {
      uriClient: this.uriClient,
      uriAction: this.uriAction,
      uriRoute: this.uriRoute,
      uriPage: this.uriPage,
      bundle: this.bundle,
      route: this.route,
      hash: this.hash,
      type: this.type,
    };
  }

  get [Symbol.toStringTag]() {
    return 'HubroHierarchyEntry';
  }
}
