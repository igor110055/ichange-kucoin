class redisRequester {
  async set(key, value, expireTime) {
    try {
      const data = await client.set(key, value, {
        EX: expireTime,
      });
      return true;
    } catch (error) {
      throw new Error(error);
      return false;
    }
  }

  async get(key) {
    const data = await client.get(key);
    return data;
  }
}

module.exports = new redisRequester();
