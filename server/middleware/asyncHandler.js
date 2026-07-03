/**
 * Express 4 doesn't forward rejected promises from async handlers to error
 * middleware — they become unhandled rejections and crash the whole
 * process. Since one process now serves every tenant, a single bad request
 * (e.g. an unexpected DB shape) would take down every store, not just one.
 * This wrapper forwards any thrown/rejected error to next() instead.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
