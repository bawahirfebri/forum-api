const GetAllComments = require('../GetAllComments');

describe('a GetAllComments entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      rawComments: [],
    };

    // Action and Assert
    expect(() => new GetAllComments(payload)).toThrowError('GET_ALL_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      rawComments: [],
      rawReplies: true,
    };

    // Action and Assert
    expect(() => new GetAllComments(payload)).toThrowError('GET_ALL_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get all comments object correctly', () => {
    // Arrange
    const payload = {
      rawComments: [{
        id: 'comment-123',
        username: 'johndoe',
        date: new Date(),
        content: 'sebuah comment',
        isDelete: false,
      }],
      rawReplies: [{
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        date: new Date(),
        username: 'dicoding',
        commentId: 'comment-123',
        isDelete: true,
      }],
    };

    // Action
    const { comments } = new GetAllComments(payload);

    // Assert
    const expectedComments = [
      {
        id: payload.rawComments[0].id,
        username: payload.rawComments[0].username,
        date: payload.rawComments[0].date,
        content: payload.rawComments[0].content,
        replies: [
          {
            id: payload.rawReplies[0].id,
            content: payload.rawReplies[0].content,
            date: payload.rawReplies[0].date,
            username: payload.rawReplies[0].username,
          },
        ],
      },
    ];
    expect(comments).toEqual(expectedComments);
  });
});
