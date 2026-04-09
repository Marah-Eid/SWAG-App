import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postsAPI from '../../api/postsAPI';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    const result = await postsAPI.getPosts(params);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchById',
  async (id, { rejectWithValue }) => {
    const result = await postsAPI.getPostById(id);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (data, { rejectWithValue }) => {
    const result = await postsAPI.createPost(data);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id, { rejectWithValue }) => {
    const result = await postsAPI.deletePost(id);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, { rejectWithValue }) => {
    const result = await postsAPI.toggleLike(postId);
    if (result.success) return { postId, data: result.data };
    return rejectWithValue(result.error);
  }
);

export const toggleSave = createAsyncThunk(
  'posts/toggleSave',
  async (postId, { rejectWithValue }) => {
    const result = await postsAPI.toggleSave(postId);
    if (result.success) return { postId, data: result.data };
    return rejectWithValue(result.error);
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId, { rejectWithValue }) => {
    const result = await postsAPI.getComments(postId);
    if (result.success) return { postId, comments: result.data };
    return rejectWithValue(result.error);
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, commentText }, { rejectWithValue }) => {
    const result = await postsAPI.addComment(postId, commentText);
    if (!result.success) return rejectWithValue(result.error);
    // Re-fetch comments to get the full comment object from the server
    const commentsResult = await postsAPI.getComments(postId);
    if (commentsResult.success) return { postId, comments: commentsResult.data };
    return { postId, comments: [] };
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    const result = await postsAPI.deleteComment(postId, commentId);
    if (result.success) return { postId, commentId };
    return rejectWithValue(result.error);
  }
);

export const fetchMyLikes = createAsyncThunk(
  'posts/fetchMyLikes',
  async (_, { rejectWithValue }) => {
    const result = await postsAPI.getMyLikes();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchMyComments = createAsyncThunk(
  'posts/fetchMyComments',
  async (_, { rejectWithValue }) => {
    const result = await postsAPI.getMyComments();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const submitReview = createAsyncThunk(
  'posts/submitReview',
  async ({ vendorId, rating, feedback }, { rejectWithValue }) => {
    const result = await postsAPI.addReview(vendorId, rating, feedback);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    selectedPost: null,
    comments: {},     // { [postId]: comment[] }
    likedPosts: [],
    myComments: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPosts.fulfilled, (state, action) => { state.loading = false; state.posts = action.payload; })
      .addCase(fetchPosts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPostById.fulfilled, (state, action) => { state.selectedPost = action.payload; })
      .addCase(createPost.pending, (state) => { state.creating = true; })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => { state.creating = false; state.error = action.payload; })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.isLiked = !post.isLiked;
          post.likeCount = post.isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1;
        }
        const liked = state.likedPosts.find(p => p.id === postId);
        if (liked) {
          liked.isLiked = !liked.isLiked;
          liked.likeCount = liked.isLiked ? (liked.likeCount || 0) + 1 : (liked.likeCount || 1) - 1;
        }
      })
      .addCase(toggleSave.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.isSaved = !post.isSaved;
          post.saveCount = post.isSaved ? (post.saveCount || 0) + 1 : (post.saveCount || 1) - 1;
        }
        const liked = state.likedPosts.find(p => p.id === postId);
        if (liked) {
          liked.isSaved = !liked.isSaved;
          liked.saveCount = liked.isSaved ? (liked.saveCount || 0) + 1 : (liked.saveCount || 1) - 1;
        }
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
        const post = state.posts.find(p => p.id === postId);
        if (post) post.commentCount = comments.length;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(c => c.id !== commentId);
        }
        state.myComments = state.myComments.filter(c => c.id !== commentId);
      })
      .addCase(fetchMyLikes.fulfilled, (state, action) => { state.likedPosts = action.payload; })
      .addCase(fetchMyComments.fulfilled, (state, action) => { state.myComments = action.payload; });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
