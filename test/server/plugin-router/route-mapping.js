import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  dynamicSegment,
  catchAllSegment,
  optionalCatchAllSegment,
  mapFileSystemRoute,
} from '../../../lib/server/plugins/router/router-mapping.js';

test('.dynamicSegment() - No slug', () => {
  const result = dynamicSegment('/foo/bar/xyz');
  assert.equal(result, '/foo/bar/xyz', 'Should have no mapping');
});

test('.dynamicSegment() - Has slug - /foo/[bar]/xyz', () => {
  const result = dynamicSegment('/foo/[bar]/xyz');
  assert.equal(result, '/foo/:bar/xyz', 'Should have mapping');
});

test('.dynamicSegment() - Has slug - /foo/[bar]/[xyz]', () => {
  const result = dynamicSegment('/foo/[bar]/[xyz]');
  assert.equal(result, '/foo/:bar/:xyz', 'Should have mapping');
});

test('.dynamicSegment() - Has slug - /foo/[bar]-[xyz]/abc', () => {
  const result = dynamicSegment('/foo/[bar]-[xyz]/abc');
  assert.equal(result, '/foo/:bar-:xyz/abc', 'Should have mapping');
});

test('.catchAllSegment() - No slug', () => {
  const result = catchAllSegment('/foo/bar/xyz');
  assert.equal(result, '/foo/bar/xyz', 'Should have no mapping');
});

test('.catchAllSegment() - Has slug - /foo/bar/[...xyz]', () => {
  const result = catchAllSegment('/foo/bar/[...xyz]');
  assert.equal(result, '/foo/bar/*', 'Should have mapping');
});

test('.optionalCatchAllSegment() - No slug', () => {
  const result = optionalCatchAllSegment('/foo/bar/xyz');
  assert.equal(result, '/foo/bar/xyz', 'Should have no mapping');
});

test('.optionalCatchAllSegment() - Has slug - /foo/bar/[[...xyz]]', () => {
  const result = optionalCatchAllSegment('/foo/bar/[[...xyz]]');
  assert.equal(result, '/foo/bar/:xyz?', 'Should have mapping');
});

test('.mapFileSystemRoute() - No slug', () => {
  const result = mapFileSystemRoute('/foo/bar/xyz');
  assert.equal(result, '/foo/bar/xyz', 'Should have no mapping');
});
