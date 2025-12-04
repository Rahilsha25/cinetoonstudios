(function () {
    'use strict';

    const safeStorage = (() => {
        try {
            const key = '__cinetoon_test__';
            window.localStorage.setItem(key, '1');
            window.localStorage.removeItem(key);
            return window.localStorage;
        } catch (err) {
            console.warn('LocalStorage unavailable, falling back to in-memory store.', err);
            return null;
        }
    })();

    const likesKey = 'cinetoon_article_likes';
    const commentsKey = 'cinetoon_article_comments';

    const memoryStore = {
        [likesKey]: {},
        [commentsKey]: {}
    };

    const StorageManager = {
        get (key) {
            if (safeStorage) {
                try {
                    return JSON.parse(safeStorage.getItem(key) || '{}');
                } catch (err) {
                    console.warn('Unable to parse storage payload', err);
                    return {};
                }
            }
            return memoryStore[key] || {};
        },
        set (key, value) {
            if (safeStorage) {
                safeStorage.setItem(key, JSON.stringify(value));
            } else {
                memoryStore[key] = value;
            }
        }
    };

    const ArticleInteractions = {
        getLikes (id) {
            const likes = StorageManager.get(likesKey);
            return likes[id] || 0;
        },
        incrementLikes (id) {
            const likes = StorageManager.get(likesKey);
            likes[id] = (likes[id] || 0) + 1;
            StorageManager.set(likesKey, likes);
            return likes[id];
        },
        getComments (id) {
            const comments = StorageManager.get(commentsKey);
            return comments[id] || [];
        },
        addComment (id, payload) {
            const comments = StorageManager.get(commentsKey);
            const next = comments[id] || [];
            next.unshift(payload);
            comments[id] = next.slice(0, 20); // keep recent comments manageable
            StorageManager.set(commentsKey, comments);
            return comments[id];
        }
    };

    const ArticlePage = {
        init () {
            this.root = document.querySelector('#article-page-root');
            if (!this.root) return;

            this.feedEl = this.root.querySelector('.articles-feed');
            this.tagsContainer = this.root.querySelector('.article-tags');
            this.searchInput = document.querySelector('#articleSearch');
            this.cards = Array.from(this.feedEl.querySelectorAll('.article-card'));

            if (this.cards.length === 0) return;

            this.state = {
                activeTag: 'all'
            };

            this.cards.forEach(card => this.initializeCard(card));
            this.buildTagFilters();
            this.attachEvents();
            this.applyFilters();
        },

        initializeCard (card) {
            const fallbackId = `article-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const articleId = card.dataset.articleId || card.id || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : fallbackId);
            card.dataset.articleId = articleId;

            const likeButton = card.querySelector('.like-button');
            if (likeButton) {
                this.updateLikeButton(likeButton, ArticleInteractions.getLikes(articleId));
                likeButton.addEventListener('click', () => {
                    const updated = ArticleInteractions.incrementLikes(articleId);
                    this.updateLikeButton(likeButton, updated);
                    likeButton.classList.add('liked');
                    setTimeout(() => likeButton.classList.remove('liked'), 400);
                });
            }

            const commentList = card.querySelector('.comment-list');
            if (commentList) {
                this.renderComments(articleId, commentList);
            }

            const form = card.querySelector('.comment-form');
            if (form && commentList) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const name = form.commenter.value.trim();
                    const comment = form.comment.value.trim();
                    if (!name || !comment) return;

                    ArticleInteractions.addComment(articleId, {
                        name,
                        text: comment,
                        createdAt: new Date().toISOString()
                    });

                    form.reset();
                    this.renderComments(articleId, commentList);
                    this.updateCommentCount(card, articleId);
                });
            }

            this.updateCommentCount(card, articleId);
        },

        updateLikeButton (button, count) {
            button.querySelector('span').textContent = `${count} ${count === 1 ? 'Like' : 'Likes'}`;
        },

        updateCommentCount (card, articleId) {
            const headerCount = card.querySelector('.comment-count');
            if (headerCount) {
                const total = ArticleInteractions.getComments(articleId).length;
                headerCount.textContent = total;
            }
        },

        attachEvents () {
            if (this.searchInput) {
                this.searchInput.addEventListener('input', this.debouncedFilter());
            }
        },

        debouncedFilter () {
            let timeout;
            return () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.applyFilters(), 180);
            };
        },

        buildTagFilters () {
            if (!this.tagsContainer) return;

            const tags = new Set(['all']);
            this.cards.forEach(card => {
                (card.dataset.tags || '')
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean)
                    .forEach(tag => tags.add(tag));
            });

            this.tagsContainer.innerHTML = '';

            tags.forEach(tag => {
                const button = document.createElement('button');
                button.className = `tag-chip${tag === 'all' ? ' active' : ''}`;
                button.dataset.tag = tag;
                button.type = 'button';
                button.textContent = tag === 'all' ? 'All topics' : tag;
                button.setAttribute('aria-pressed', tag === this.state.activeTag);
                button.addEventListener('click', () => this.handleTagChange(tag, button));
                this.tagsContainer.appendChild(button);
            });
        },

        handleTagChange (tag, button) {
            this.state.activeTag = tag;
            if (this.tagsContainer) {
                this.tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
                    const isActive = chip === button;
                    chip.classList.toggle('active', isActive);
                    chip.setAttribute('aria-pressed', isActive);
                });
            }
            this.applyFilters();
        },

        applyFilters () {
            const query = (this.searchInput?.value || '').toLowerCase().trim();
            const activeTag = this.state.activeTag.toLowerCase();

            let visibleCount = 0;

            this.cards.forEach(card => {
                const tags = (card.dataset.tags || '').toLowerCase();
                const searchable = [
                    card.dataset.search || '',
                    card.querySelector('h2')?.textContent || '',
                    card.querySelector('.article-card-body p')?.textContent || ''
                ].join(' ').toLowerCase();

                const matchesTag = activeTag === 'all' || tags.includes(activeTag);
                const matchesQuery = !query || searchable.includes(query);
                const shouldShow = matchesTag && matchesQuery;

                card.classList.toggle('is-hidden', !shouldShow);
                card.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
                if (shouldShow) visibleCount++;
            });

            this.toggleEmptyState(visibleCount === 0);
        },

        toggleEmptyState (showEmpty) {
            if (!this.emptyState && showEmpty) {
                this.emptyState = document.createElement('div');
                this.emptyState.className = 'articles-empty';
                this.emptyState.textContent = 'Nothing matches your filters. Try another keyword or tag.';
                this.feedEl.appendChild(this.emptyState);
            }

            if (this.emptyState) {
                this.emptyState.hidden = !showEmpty;
            }
        },

        renderComments (articleId, target) {
            const comments = ArticleInteractions.getComments(articleId);
            target.innerHTML = '';

            if (comments.length === 0) {
                const placeholder = document.createElement('li');
                placeholder.className = 'comment-empty';
                placeholder.textContent = 'Be the first to share feedback on this article.';
                target.appendChild(placeholder);
                return;
            }

            comments.forEach(comment => {
                const item = document.createElement('li');
                item.className = 'comment-item';
                const name = document.createElement('strong');
                name.textContent = comment.name;
                const meta = document.createElement('span');
                meta.textContent = this.formatDate(comment.createdAt);
                const copy = document.createElement('p');
                copy.textContent = comment.text;

                item.appendChild(name);
                item.appendChild(meta);
                item.appendChild(copy);
                target.appendChild(item);
            });
        },

        formatDate (value) {
            const date = value ? new Date(value) : null;
            if (!date || Number.isNaN(date.getTime())) return 'Recently';
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const ArticleDetail = {
        init () {
            this.detail = document.querySelector('[data-article-detail]');
            if (!this.detail) return;

            this.articleId = this.detail.dataset.articleId;
            if (!this.articleId) return;

            this.likeButton = this.detail.querySelector('.like-button');
            this.commentList = this.detail.querySelector('.comment-list');
            this.commentCount = this.detail.querySelector('.comment-count');
            this.form = this.detail.querySelector('.comment-form');

            if (this.likeButton) {
                this.updateLikeButton(ArticleInteractions.getLikes(this.articleId));
                this.likeButton.addEventListener('click', () => {
                    const updated = ArticleInteractions.incrementLikes(this.articleId);
                    this.updateLikeButton(updated);
                    this.likeButton.classList.add('liked');
                    setTimeout(() => this.likeButton.classList.remove('liked'), 400);
                });
            }

            if (this.commentList) {
                this.renderComments();
            }

            if (this.form && this.commentList) {
                this.form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const name = this.form.commenter.value.trim();
                    const text = this.form.comment.value.trim();
                    if (!name || !text) return;

                    ArticleInteractions.addComment(this.articleId, {
                        name,
                        text,
                        createdAt: new Date().toISOString()
                    });

                    this.form.reset();
                    this.renderComments();
                });
            }
        },

        updateLikeButton (count) {
            if (!this.likeButton) return;
            this.likeButton.querySelector('span').textContent = `${count} ${count === 1 ? 'Like' : 'Likes'}`;
        },

        renderComments () {
            if (!this.commentList) return;
            const comments = ArticleInteractions.getComments(this.articleId);
            this.commentList.innerHTML = '';

            if (comments.length === 0) {
                const placeholder = document.createElement('li');
                placeholder.className = 'comment-empty';
                placeholder.textContent = 'Be the first to share feedback on this article.';
                this.commentList.appendChild(placeholder);
            } else {
                comments.forEach(comment => {
                    const item = document.createElement('li');
                    item.className = 'comment-item';
                    item.innerHTML = `
                        <strong>${comment.name}</strong>
                        <span>${ArticlePage.formatDate(comment.createdAt)}</span>
                        <p>${comment.text}</p>
                    `;
                    this.commentList.appendChild(item);
                });
            }

            if (this.commentCount) {
                this.commentCount.textContent = comments.length;
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        ArticlePage.init();
        ArticleDetail.init();
    });
})();

