class GetComment {
  constructor(payload) {
    this._validatePayload(payload);

    const { id, username, date, content, isDelete } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.isDelete = isDelete;
  }

  _validatePayload({ id, username, date, content, isDelete }) {
    if (!id || !username || !date || !content || isDelete === undefined) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' || 
      typeof username !== 'string' ||
      typeof date !== 'object' ||
      typeof content !== 'string' ||
      typeof isDelete !== 'boolean' 
    ) {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;
