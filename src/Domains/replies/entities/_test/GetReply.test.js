const GetReply = require('../GetReply');

describe('a GetReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah comment reply',
      date: new Date(),
      username: 'dicoding',
      isDelete: false,
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah comment reply',
      date: new Date(),
      username: 'dicoding',
      commentId: 123,
      isDelete: false,
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah comment reply',
      date: new Date(),
      username: 'dicoding',
      commentId: 'comment-123',
      isDelete: false,
    };

    // Action
    const { id, content, date, username, commentId, isDelete } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
    expect(isDelete).toEqual(payload.isDelete);
  });

  it('should get reply object correctly when isDelete is true', async () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah comment reply',
      date: new Date(),
      username: 'dicoding',
      commentId: 'comment-123',
      isDelete: true,
    };

    // Action
    const { id, content, date, username, commentId, isDelete } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
    expect(isDelete).toEqual(payload.isDelete);
  });
});
