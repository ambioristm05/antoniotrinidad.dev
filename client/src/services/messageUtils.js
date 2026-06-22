export const buildMessageQuery = ({ filter = 'all', page = 1, search = '' } = {}) => ({
  page,
  limit: 10,
  sort: '-createdAt',
  ...(filter !== 'all' ? { status: filter } : {}),
  ...(search.trim() ? { search: search.trim() } : {}),
});

export const replaceMessage = (messages, updatedMessage) =>
  messages.map((message) => (message._id === updatedMessage._id ? updatedMessage : message));

export const removeMessage = (messages, id) =>
  messages.filter((message) => message._id !== id);
