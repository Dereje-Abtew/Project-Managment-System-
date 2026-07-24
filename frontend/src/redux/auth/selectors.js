import { createSelector } from 'reselect';
const authSelect = (state) => state.auth;

export const selectAuth = createSelector([authSelect], (auth) => auth);
export const isLoggedIn = createSelector([authSelect], (auth) => auth.isLoggedIn);
