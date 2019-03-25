class Feature {
  constructor(name, mocks) {
    if (!name || !mocks || !mocks.length) {
      throw new Error(`Feature not well formed: ${name}`);
    }
  }
}
