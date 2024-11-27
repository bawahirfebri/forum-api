const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const reply = new AddReply({
        content: 'sebuah comment reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(reply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const reply = new AddReply({
        content: 'sebuah comment reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(reply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        ...reply,
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return reply correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const actualResult = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      const expectedReplyDate = await RepliesTableTestHelper.findDateById('reply-123');
      const expectedResult = [
        new GetReply({
          id: 'reply-123',
          content: 'sebuah comment reply',
          date: expectedReplyDate,
          username: 'dicoding',
          commentId: 'comment-123',
          isDelete: false,
        }),
      ];
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply from database', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toEqual(true);
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner is not correct', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner is correct', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
