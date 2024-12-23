class GetThread {
  constructor(payload) {
    this._validatePayload(payload);

    const {
      id, title, body, date, username,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
  }

  _validatePayload({
    id, title, body, date, username,
  }) {
    if (!id || !title || !body || date === undefined || !username) {
      throw new Error('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string' || typeof date !== 'object' || typeof username !== 'string'
    ) {
      throw new Error('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThread;
