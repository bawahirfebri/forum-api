const AddReply = require('../AddReply');

describe('an AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: ['sebuah comment reply'],
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const {
      content, commentId, threadId, owner,
    } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
  });
});
