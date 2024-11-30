const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeComment = require('../../../Domains/likes/entities/LikeComment');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLikeComment function', () => {
    it('should persist add like comment', async () => {
      // Arrange
      const likeComment = new LikeComment({
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.addLikeComment(likeComment);

      // Assert
      const likesComment = await LikesTableTestHelper.findLikeCommentById('like-123');
      expect(likesComment).toHaveLength(1);
    });
  });

  describe('verifyAvailableLikeComment function', () => {
    it('should return undefined when like comment not available', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.verifyAvailableLikeComment('comment-123', 'user-123');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return id when like comment available', async () => {
      // Arrange
      await LikesTableTestHelper.addLikeComment({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.verifyAvailableLikeComment('comment-123', 'user-123');

      // Assert
      expect(result).toEqual('like-123');
    });
  });

  describe('deleteLikeCommentById function', () => {
    it('should delete like comment from database', async () => {
      // Arrange
      await LikesTableTestHelper.addLikeComment({ id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      likeRepositoryPostgres.deleteLikeCommentById('like-123');

      // Assert
      const likeComment = await LikesTableTestHelper.findLikeCommentById('like-123');
      expect(likeComment).toHaveLength(0);
    });
  });
});
