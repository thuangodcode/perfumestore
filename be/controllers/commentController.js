// controllers/commentController.js
const Perfume = require('../models/Perfume');

// --------------------
// 💬 Add a comment
// --------------------
exports.addComment = async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const { rating, content } = req.body;
    const userId = req.user.id;

    const perfume = await Perfume.findById(perfumeId);
    if (!perfume) {
      return res.status(404).json({ success: false, message: 'Perfume not found' });
    }

    // ✅ Check duplicate comment by same user
    const existing = perfume.comments.find(c => c.author.toString() === userId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already commented on this perfume'
      });
    }

    // ✅ Validate rating
    const numRating = parseInt(rating);
    if (![1, 2, 3].includes(numRating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be 1, 2, or 3'
      });
    }

    perfume.comments.push({ rating: numRating, content, author: userId });
    await perfume.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: err.message
    });
  }
};

// --------------------
// ✏️ Update comment
// --------------------
exports.updateComment = async (req, res) => {
  try {
    const { perfumeId, commentId } = req.params;
    const userId = req.user.id;
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    const comment = perfume.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== userId)
      return res.status(403).json({ success: false, message: 'You cannot edit this comment' });

    const numRating = parseInt(req.body.rating);
    if (req.body.rating && ![1, 2, 3].includes(numRating))
      return res.status(400).json({ success: false, message: 'Invalid rating value' });

    comment.rating = req.body.rating ?? comment.rating;
    comment.content = req.body.content ?? comment.content;

    await perfume.save();

    res.json({
      success: true,
      message: 'Comment updated successfully'
    });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment',
      error: err.message
    });
  }
};

// --------------------
// ❌ Delete comment
// --------------------
exports.deleteComment = async (req, res) => {
  try {
    const { perfumeId, commentId } = req.params;
    const currentUser = req.user; // id + isAdmin
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    const comment = perfume.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ success: false, message: 'Comment not found' });

    // 🔹 Lấy authorId dạng string
    let authorId = '';
    if (comment.author?._id) authorId = comment.author._id.toString();
    else if (typeof comment.author === 'string') authorId = comment.author;
    else if (comment.author?._id?.toString) authorId = comment.author._id.toString();

    const isAdmin = currentUser.isAdmin === true;
    const isAuthor = authorId === currentUser.id;

    console.log('==== DELETE COMMENT DEBUG ====');
    console.log('currentUser:', currentUser);
    console.log('comment.author:', comment.author);
    console.log('authorId:', authorId);
    console.log('isAdmin:', isAdmin, 'isAuthor:', isAuthor);

    if (!isAdmin && !isAuthor)
      return res.status(403).json({ success: false, message: 'You cannot delete this comment' });

    comment.deleteOne();
    await perfume.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment',
      error: err.message
    });
  }
};


// --------------------
// 🔍 Get perfume detail (with comments + avg rating)
// --------------------
exports.showPerfumeDetail = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name email');

    if (!perfume)
      return res.status(404).json({ success: false, message: 'Perfume not found' });

    let avgRating = 0;
    if (perfume.comments.length > 0) {
      const sum = perfume.comments.reduce((acc, c) => acc + c.rating, 0);
      avgRating = (sum / perfume.comments.length).toFixed(1);
    }

    res.json({
      success: true,
      message: 'Perfume detail fetched successfully',
      data: {
        perfume,
        avgRating
      }
    });
  } catch (err) {
    console.error('Error fetching perfume detail:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching perfume detail',
      error: err.message
    });
  }
};
