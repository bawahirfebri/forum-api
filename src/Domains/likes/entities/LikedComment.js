class LikedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, commentId, owner } = payload;

    this.id = id;
    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload({ id, commentId, owner }) {
    if (!id || !commentId || !owner) {
      throw new Error('LIKED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('LIKED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikedComment;
