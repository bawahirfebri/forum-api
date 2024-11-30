const LikeComment = require('../../Domains/likes/entities/LikeComment');

class LikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, owner } = new LikeComment(useCasePayload);

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    const id = await this._likeRepository.verifyAvailableLikeComment(commentId, owner);

    if (id) {
      return this._likeRepository.deleteLikeCommentById(id);
    }

    return this._likeRepository.addLikeComment(useCasePayload);
  }
}

module.exports = LikeCommentUseCase;
