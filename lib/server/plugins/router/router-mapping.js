const DYN_SEGMENT_REGEX = new RegExp(/\[\w*?\]/g);

/**
 * Dynamic Segment
 *
 * Map any [slug] segments in the path from a file based
 * route to Fastifys :slug
 *
 * @param {String} [fileSystemRoute] File system path to map
 * @returns {String}
 */
export const dynamicSegment = (fileSystemRoute = '/') => {
  return fileSystemRoute.replace(DYN_SEGMENT_REGEX, (name) => {
    return `:${name.slice(1, name.length - 1)}`;
  });
};

/**
 * Catch-All Segment
 *
 * Map a [...slug] segment at the end of a path from a file
 * based route to Fastifys /*.
 *
 * @param {String} [fileSystemRoute] File system path to map
 * @returns {String}
 */
export const catchAllSegment = (fileSystemRoute = '/') => {
  const start = fileSystemRoute.lastIndexOf('/');
  const end = fileSystemRoute.length;

  if (fileSystemRoute.substring(start + 1, start + 5) === '[...' && fileSystemRoute.substring(end - 1, end) === ']') {
    return `${fileSystemRoute.slice(0, start + 1)}*`;
  }

  return fileSystemRoute;
};

/**
 * Optional Catch-All Segment
 *
 * Map a [[...slug]] segment at the end of a path from a file
 * based route to Fastifys /:slug?
 *
 * @param {String} [fileSystemRoute] File system path to map
 * @returns {String}
 */
export const optionalCatchAllSegment = (fileSystemRoute = '/') => {
  const start = fileSystemRoute.lastIndexOf('/');
  const end = fileSystemRoute.length;

  if (fileSystemRoute.substring(start + 1, start + 6) === '[[...' && fileSystemRoute.substring(end - 2, end) === ']]') {
    return `${fileSystemRoute.slice(0, start + 1)}:${fileSystemRoute.slice(start + 6, end - 2)}?`;
  }

  return fileSystemRoute;
};

/**
 * Map file system route to Fastify route
 *
 * Run all needed sequenses needed to map a file system route
 * to a Fastify route.
 *
 * @param {String} [fileSystemRoute] File system path to map
 * @returns {String}
 */
export const mapFileSystemRoute = (fileSystemRoute = '/') => {
  let route = fileSystemRoute;

  route = optionalCatchAllSegment(route);
  route = catchAllSegment(route);
  route = dynamicSegment(route);

  return route;
};
