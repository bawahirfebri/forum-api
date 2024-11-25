const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { id } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(id);
    const thread = await this._threadRepository.getThreadsById(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);

    const commentsWithReplies = await this._mapCommentsWithReplies(comments);

    return { ...thread, comments: commentsWithReplies };
  }

  _validatePayload(payload) {
    const { id } = payload;

    if (!id) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    };

    if (typeof id !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    };
  }

  async _mapCommentsWithReplies(comments) {
    return Promise.all(comments.map(async (comment) => {
      const getReplies = await this._replyRepository.getRepliesByCommentId(comment.id)

      const replies = getReplies.map(reply => {
        const { id, content, date, username } = new GetReply(reply);

        return { id, content, date, username };
      });

      const { id, username, date, content } = new GetComment(comment);

      return {
        id,
        username,
        date,
        content,
        replies,
      };
    }));
  }
}

module.exports = GetThreadUseCase;
