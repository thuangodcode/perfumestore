const Perfume = require('../models/Perfume');

exports.addComment = async (req, res) => {
  const perfumeId = req.params.perfumeId;
  const { rating, content } = req.body;
  const userId = req.user.id;

  const perfume = await Perfume.findById(perfumeId);
  if (!perfume) return res.status(404).json({ msg: 'Perfume not found' });

  // check if author already commented on this perfume
  const existing = perfume.comments.find(c => c.author.toString() === userId);
  if (existing) return res.status(400).json({ msg: 'You already commented this perfume' });

  perfume.comments.push({ rating, content, author: userId });
  await perfume.save();
  res.status(201).json({ msg: 'Comment added' });
};

exports.updateComment = async (req, res) => {
  const { perfumeId, commentId } = req.params;
  const userId = req.user.id;
  const perfume = await Perfume.findById(perfumeId);
  if (!perfume) return res.status(404).json({ msg: 'Perfume not found' });

  const comment = perfume.comments.id(commentId);
  if (!comment) return res.status(404).json({ msg: 'Comment not found' });
  if (comment.author.toString() !== userId) return res.status(403).json({ msg: 'Forbidden' });

  comment.rating = req.body.rating ?? comment.rating;
  comment.content = req.body.content ?? comment.content;
  await perfume.save();
  res.json({ msg: 'Updated' });
};

exports.deleteComment = async (req, res) => {
  const { perfumeId, commentId } = req.params;
  const userId = req.user.id;
  const perfume = await Perfume.findById(perfumeId);
  if (!perfume) return res.status(404).json({ msg: 'Perfume not found' });

  const comment = perfume.comments.id(commentId);
  if (!comment) return res.status(404).json({ msg: 'Comment not found' });
  if (comment.author.toString() !== userId) return res.status(403).json({ msg: 'Forbidden' });

  comment.remove();
  await perfume.save();
  res.json({ msg: 'Deleted' });
};

exports.showPerfumeDetail = async (req, res) => {
  const perfume = await Perfume.findById(req.params.id)
    .populate('brand')
    .populate('comments.author'); // để hiện tên người comment

  if (!perfume) return res.status(404).render('404');

  // Tính trung bình rating
  let avgRating = 0;
  if (perfume.comments.length > 0) {
    const sum = perfume.comments.reduce((acc, c) => acc + c.rating, 0);
    avgRating = (sum / perfume.comments.length).toFixed(1);
  }

  res.render('perfumeDetail', {
    perfume,
    avgRating,
    user: req.user || null,
  });
};

