export const emptyCommentForm = {
  authorName: '',
  authorEmail: '',
  message: '',
  website: '',
};

export const emptyReplyForm = {
  ...emptyCommentForm,
};

export const commentFormToPayload = (form) => ({
  authorName: form.authorName.trim(),
  authorEmail: form.authorEmail.trim(),
  message: form.message.trim(),
  ...(form.website.trim() && { website: form.website.trim() }),
});

export const replyFormToPayload = (form) => {
  const payload = commentFormToPayload(form);

  if (!payload.authorEmail) {
    delete payload.authorEmail;
  }

  return payload;
};

export const addComment = (comments, comment) => [comment, ...comments];

export const addReplyToComment = (comments, commentId, reply) =>
  comments.map((comment) =>
    comment._id === commentId
      ? { ...comment, replies: [...(comment.replies ?? []), reply] }
      : comment,
  );
