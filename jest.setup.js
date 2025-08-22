// In jest.setup.js
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    text: () => Promise.resolve('{}')
  })
);
