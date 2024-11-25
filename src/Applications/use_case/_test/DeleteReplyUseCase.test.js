const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      id: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      id: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 123,
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete reply by id action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating depedency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyAvailableReply)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(useCasePayload.id, useCasePayload.owner);
    expect(mockReplyRepository.deleteReplyById)
      .toHaveBeenCalledWith(useCasePayload.id);
  });
});
