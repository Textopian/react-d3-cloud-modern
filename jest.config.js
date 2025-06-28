module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/jest-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/examples/', '/lib/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(d3-|react-faux-dom)/)',
  ],
  timers: 'fake',
  resetModules: true,
  resetMocks: true,
};
