class GetReply {
  constructor(payload) {
    this._validatePayload(payload);

    const {
      id, content, date, username, commentId, isDelete,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
    this.commentId = commentId;
    this.isDelete = isDelete;
  }

  _validatePayload({
    id, content, date, username, commentId, isDelete,
  }) {
    if (
      !id || !content || date === undefined || !username || !commentId || isDelete === undefined
    ) {
      throw new Error('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'object' || typeof username !== 'string' || typeof commentId !== 'string' || typeof isDelete !== 'boolean'
    ) {
      throw new Error('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetReply;
