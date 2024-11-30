const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeComment = require('../../../Domains/likes/entities/LikeComment');
const LikedComment = require('../../../Domains/likes/entities/LikedComment');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockLikedComment = new LikedComment({
      id: 'like-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });

    /** creating depedency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyAvailableLikeComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLikeComment = jest.fn(() => Promise.resolve(mockLikedComment));

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const likedComment = await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(likedComment).toStrictEqual(mockLikedComment);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyAvailableLikeComment)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.addLikeComment).toBeCalledWith(new LikeComment({
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /** creating depedency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyAvailableLikeComment = jest.fn(() => Promise.resolve('like-123'));
    mockLikeRepository.deleteLikeCommentById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyAvailableLikeComment)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.deleteLikeCommentById).toBeCalledWith('like-123');
  });
});
