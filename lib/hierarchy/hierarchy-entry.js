const inspect = Symbol.for('nodejs.util.inspect.custom');

export default class HierarchyEntry {
  /** @type {URL} */
  #uriMiddleware;

  /** @type {URL} */
  #uriClient;

  /** @type {URL} */
  #uriAction;

  /** @type {URL} */
  #uriRoute;

  /** @type {URL} */
  #uriPage;

  /** @type {Boolean} */
  #bundle;

  /** @type {String} */
  #route;

  /** @type {String} */
  #hash;

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
  constructor(hash, route) {
    this.#uriMiddleware;
    this.#uriClient;
    this.#uriAction;
    this.#uriRoute;
    this.#uriPage;
    this.#bundle = false;
    this.#route = route;
    this.#hash = hash;
  }

  /**
   * @type {URL}
   * @return {URL}
   */
  set uriMiddleware(value) {
    this.#uriMiddleware = value;
  }

  get uriMiddleware() {
    return this.#uriMiddleware;
  }

  /**
   * @type {URL}
   * @return {URL}
   */
  set uriClient(value) {
    this.#uriClient = value;
    this.#bundle = true;
  }

  get uriClient() {
    return this.#uriClient;
  }

  /**
   * @type {URL}
   * @return {URL}
   */
  set uriAction(value) {
    this.#uriAction = value;
  }

  get uriAction() {
    return this.#uriAction;
  }

  /**
   * @type {URL}
   * @return {URL}
   */
  set uriRoute(value) {
    this.#uriRoute = value;
  }

  get uriRoute() {
    return this.#uriRoute;
  }

  /**
   * @type {URL}
   * @return {URL}
   */
  set uriPage(value) {
    this.#uriPage = value;
  }

  get uriPage() {
    return this.#uriPage;
  }

  /**
   * @type {Boolean}
   * @throws {Error} Read only-property
   */
  set bundle(value) {
    throw new Error('Cannot set read-only property.');
  }

  get bundle() {
    return this.#bundle;
  }

  /**
   * @type {String}
   * @throws {Error} Read only-property
   */
  set route(value) {
    throw new Error('Cannot set read-only property.');
  }

  get route() {
    return this.#route;
  }

  /**
   * @type {String}
   * @throws {Error} Read only-property
   */
  set hash(value) {
    throw new Error('Cannot set read-only property.');
  }

  get hash() {
    return this.#hash;
  }

  /**
   * @type {String}
   * @throws {Error} Read only-property
   */
  set type(value) {
    throw new Error('Cannot set read-only property.');
  }

  get type() {
    if (this.uriRoute?.href !== undefined) {
      return 'api';
    }

    if (this.uriClient?.href !== undefined && this.uriAction?.href === undefined && this.uriPage?.href === undefined) {
      return 'client';
    }

    if (this.uriAction?.href !== undefined || this.uriPage?.href !== undefined) {
      return 'page';
    }

    return 'empty';
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
