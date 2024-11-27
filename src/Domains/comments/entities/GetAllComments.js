const GetReply = require('../../replies/entities/GetReply');
const GetComment = require('./GetComment');

class GetAllComments {
  constructor(payload) {
    this._validatePayload(payload);

    this.comments = this._mapCommentsWithReplies(payload);
  }

  _validatePayload({ rawComments, rawReplies }) {
    if (!rawComments || !rawReplies) {
      throw new Error('GET_ALL_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof rawComments !== 'object' || typeof rawReplies !== 'object') {
      throw new Error('GET_ALL_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _mapCommentsWithReplies(payload) {
    const { rawComments, rawReplies } = payload;

    return rawComments.map((comment) => {
      const relatedReplies = rawReplies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          const {
            id, content, date, username,
          } = new GetReply(reply);

          return {
            id, content, date, username,
          };
        });

      const {
        id, username, date, content,
      } = new GetComment(comment);

      return {
        id, username, date, content, replies: relatedReplies,
      };
    });
  }
}

module.exports = GetAllComments;
