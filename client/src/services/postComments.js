export const emptyCommentForm = {
  message: '',
  website: '',
};

export const emptyReplyForm = {
  ...emptyCommentForm,
};

export const defaultCommentAvatar = '/brand/default-user-avatar.svg';

const userStorageKeys = ['antoniotrinidad:user', 'portfolio:user', 'currentUser', 'user', 'profile'];

const defaultCommentUser = (fallbackName = 'Visitante') => ({
  authorName: fallbackName,
  authorEmail: '',
  authorAvatar: defaultCommentAvatar,
});

export const getBrowserCommentUser = (fallbackName = 'Visitante') => {
  const fallbackUser = defaultCommentUser(fallbackName);

  if (typeof window === 'undefined') {
    return fallbackUser;
  }

  for (const key of userStorageKeys) {
    let storedValue = '';

    try {
      storedValue = window.localStorage.getItem(key);
    } catch {
      return fallbackUser;
    }

    if (!storedValue) continue;

    try {
      const userData = JSON.parse(storedValue);
      const authorName = userData.name ?? userData.displayName ?? userData.username ?? userData.email;
      const authorEmail = userData.email ?? userData.authorEmail ?? '';
      const authorAvatar = userData.avatarUrl ?? userData.avatar ?? userData.photoURL ?? userData.image ?? '';

      if (authorName) {
        return {
          authorName,
          authorEmail,
          authorAvatar: authorAvatar || defaultCommentAvatar,
        };
      }
    } catch {
      return {
        ...fallbackUser,
        authorName: storedValue,
      };
    }
  }

  return fallbackUser;
};

export const commentFormToPayload = (form, user) => ({
  authorName: user.authorName.trim(),
  ...(user.authorEmail.trim() && { authorEmail: user.authorEmail.trim() }),
  ...(user.authorAvatar && user.authorAvatar !== defaultCommentAvatar && { authorAvatar: user.authorAvatar }),
  message: form.message.trim(),
  ...(form.website.trim() && { website: form.website.trim() }),
});

export const replyFormToPayload = (form, user) => commentFormToPayload(form, user);

export const addComment = (comments, comment) => [comment, ...comments];

export const addReplyToComment = (comments, commentId, reply) =>
  comments.map((comment) =>
    comment._id === commentId
      ? { ...comment, replies: [...(comment.replies ?? []), reply] }
      : comment,
  );
