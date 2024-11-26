const GetAllComments = require("../GetAllComments")

describe('a GetAllComments entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      rawComments: [],
    }
    
    // Action and Assert
    expect(() => new GetAllComments(payload)).toThrowError('GET_ALL_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      rawComments: [],
      rawReplies: true
    }
    
    // Action and Assert
    expect(() => new GetAllComments(payload)).toThrowError('GET_ALL_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  })

  it('should get all comments object correctly', () => {
    // Arrange
    const payload = {
      rawComments: [{
        id: 'comment-123',
        username: 'johndoe',
        date: '123',
        content: 'sebuah comment',
        isDelete: false
      }],
      rawReplies: [{
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        date: '123',
        username: 'dicoding',
        commentId: 'comment-123',
        isDelete: true
      }],
    };

    // Action
    const { comments } = new GetAllComments(payload);

    // Assert
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '123',
        content: 'sebuah comment',
        replies: [
          {
            id: 'reply-123',
            content: '**balasan telah dihapus**',
            date: '123',
            username: 'dicoding',
          },
        ],
      },
    ];
    expect(comments).toEqual(expectedComments);
  })
})