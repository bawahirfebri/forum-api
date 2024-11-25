class DeleteReplyUseCase {
  constructor({  replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { id, commentId, threadId, owner } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    await this._replyRepository.verifyAvailableReply(id);
    await this._replyRepository.verifyReplyOwner(id, owner);

    await this._replyRepository.deleteReplyById(id);
  }

  _validatePayload(payload){
    const { id, commentId, threadId, owner } = payload;

    if (!id || !owner || !threadId || !commentId) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
