const GetThread = require('../GetThread');

describe('a GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: '123'
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  });

  it('should throw error when did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: '123',
      username: ['dicoding'],
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  });

  it('should get Thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: '123',
      username: 'dicoding',
    };

    // Action
    const { id, title, body, date, username } = new GetThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
