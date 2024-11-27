const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating depedency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(useCasePayload);

    // Asseert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    }));
  });
});
