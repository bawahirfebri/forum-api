class GetAllComments {
  constructor(payload) {
    const { comments, replies } = payload;

    this.comments = this._mapCommentsWithReplies(payload);
  }

  _mapCommentsWithReplies(payload) {

  }
}

module.exports = GetAllComments;