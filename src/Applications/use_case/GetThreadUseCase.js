const GetAllComments = require('../../Domains/comments/entities/GetAllComments');
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
    const rawComments = await this._commentRepository.getCommentsByThreadId(id);
    const rawReplies = (await Promise.all(
      rawComments.map(comment => this._replyRepository.getRepliesByCommentId(comment.id))
    )).flat();

    const { comments } = new GetAllComments({ rawComments, rawReplies })

    return { ...thread, comments };
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
}

module.exports = GetThreadUseCase;
