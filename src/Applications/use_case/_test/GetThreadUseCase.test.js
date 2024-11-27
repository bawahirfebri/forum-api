const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const getThreadUseCase = new GetThreadUseCase({});

    // Action and Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      id: 123,
    };
    const getThreadUseCase = new GetThreadUseCase({});

    // Action and Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123',
    };

    const mockThreadDate = new Date();
    const mockCommentDate = new Date();
    const mockReplyDate = new Date();

    const mockGetThread = new GetThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: mockThreadDate,
      username: 'dicoding',
    });

    const mockGetComments = [
      new GetComment({
        id: 'comment-123',
        username: 'johndoe',
        date: mockCommentDate,
        content: 'sebuah comment',
        isDelete: false,
      }),
    ];

    const mockGetReplies = [
      new GetReply({
        id: 'reply-123',
        content: 'sebuah comment reply dihapus',
        date: mockReplyDate,
        username: 'dicoding',
        commentId: 'comment-123',
        isDelete: true,
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadsById = jest.fn(() => Promise.resolve(mockGetThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockGetComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve(mockGetReplies));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const actualGetThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    const expectedResult = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: mockThreadDate,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: mockCommentDate,
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              content: '**balasan telah dihapus**',
              date: mockReplyDate,
              username: 'dicoding',
            },
          ],
        },
      ],
    };
    expect(actualGetThread).toEqual(expectedResult);
    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadsById)
      .toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toBeCalledWith(useCasePayload.id);
    expect(mockReplyRepository.getRepliesByCommentId)
      .toBeCalledWith(mockGetComments[0].id);
  });
});
