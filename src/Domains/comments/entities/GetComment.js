class GetComment {
  constructor(payload) {
    this._validatePayload(payload);

    const {
      id, username, date, content, isDelete, likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.isDelete = isDelete;
    this.likeCount = likeCount;
  }

  _validatePayload({
    id, username, date, content, isDelete, likeCount,
  }) {
    if (
      !id || !username || !date || !content || isDelete === undefined || likeCount === undefined
    ) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'object' || typeof content !== 'string' || typeof isDelete !== 'boolean' || typeof likeCount !== 'number'
    ) {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;
