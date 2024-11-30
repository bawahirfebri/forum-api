const LikedComment = require('../LikedComment');

describe('a LikedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new LikedComment(payload)).toThrowError('LIKED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
      owner: 123,
    };

    // Action and Assert
    expect(() => new LikedComment(payload)).toThrowError('LIKED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create LikedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const { id, commentId, owner } = new LikedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
