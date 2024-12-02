const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const GetComment = require('../../Domains/comments/entities/GetComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, owner, threadId } = comment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, threadId, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(thread) {
    const query = {
      text: `
        SELECT 
          comments.id,
          comments.content,
          comments.date,
          comments.is_delete,
          users.username,
          COUNT(likes.comment_id) AS like_count
        FROM comments
        LEFT JOIN users ON users.id = comments.owner
        LEFT JOIN likes ON likes.comment_id = comments.id
        WHERE comments.thread_id = $1
        GROUP BY comments.id, users.username
        ORDER BY comments.date ASC
      `,
      values: [thread],
    };

    const result = await this._pool.query(query);

    return result.rows.map(({ is_delete, like_count, ...comment }) => (new GetComment({
      ...comment,
      isDelete: is_delete,
      likeCount: parseInt(like_count, 10),
    })));
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async verifyAvailableComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakses komen ini');
    }
  }
}

module.exports = CommentRepositoryPostgres;
