from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import List
from ..models import Post, User, PostComment, PostLike, Follow, Notification, PostView
from ..schemas import PostCreate, PostResponse, CommentCreate, PostCommentBase
from ..database import get_db
from .user import get_current_active_user
from datetime import datetime, timedelta
from ..hooks.websocket import notify_users_update
from async_lru import alru_cache
from sqlalchemy import func

# Создайте отдельный роутер для постов
router = APIRouter()


@router.post("/create_post_for_user/{user_id}/", response_model=PostResponse)
async def create_post_for_user(
        user_id: int,
        post: PostCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user),
) -> PostResponse:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Генерация slug из текущей даты и уникального идентификатора
    slug = Post.generate_slug()

    db_post = Post(title=post.title, body=post.body, author_id=current_user.id, slug=slug, main_image=post.main_image,
                   tags=post.tags, category=post.category)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    followers = db.query(Follow).filter(Follow.followed_id == current_user.id).all()

    for follower in followers:
        notification = Notification(
            user_id=follower.follower_id,
            title=f"{current_user.username} опубликовал новый пост",
            description=db_post.title,
            link=f"/posts/{db_post.slug}",
        )
        db.add(notification)

    db.commit()

    await notify_users_update()

    return db_post


@router.get("/get_posts_for_user/{user_id}/", response_model=List[PostResponse])
async def get_posts_for_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    posts = db.query(Post).filter(Post.author_id == user_id).all()
    if posts is None:
        raise HTTPException(status_code=404, detail="Posts not found")
    return posts


@alru_cache(ttl=30)
@router.get("/get_all_posts", response_model=List[PostResponse])
async def get_all_posts(
        page: int = Query(1, ge=1),  # Номер страницы (начиная с 1)
        count: int = Query(3, ge=1, le=100),  # Количество постов на страницу
        db: Session = Depends(get_db),
):
    """
    Получение всех постов с поддержкой пагинации.
    Параметры:
    - `page`: Номер страницы (по умолчанию: 1)
    - `count`: Количество постов на страницу (по умолчанию: 10)
    """
    # Вычисляем смещение
    offset = (page - 1) * count

    # Запрашиваем данные из базы с учётом пагинации
    posts = (
        db.query(Post)
        .order_by(Post.date.desc())  # Сортируем по дате (последние посты первыми)
        .offset(offset)
        .limit(count)
        .all()
    )

    return posts


@alru_cache(maxsize=128)
@router.get("/getpost/{slug:path}/", response_model=PostResponse)
async def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/create_comment/{post_id}/", response_model=PostCommentBase)
async def create_comment(
        post_id: int,
        comment: CommentCreate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = PostComment(
        post_id=post_id,
        author_id=current_user.id,
        body=comment.body,
        date=datetime.now()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


@router.post("/like_post/{post_id}/")
async def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Проверяем, лайкнул ли пользователь пост
    existing_like = db.query(PostLike).filter_by(post_id=post_id, user_id=current_user.id).first()
    if existing_like:
        raise HTTPException(status_code=400, detail="You already liked this post")

    # Создаем новый лайк
    new_like = PostLike(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    post.likes += 1
    db.commit()
    return {"likes": post.likes}


@router.post("/unlike_post/{post_id}/")
async def unlike_post(post_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Проверяем, есть ли лайк от текущего пользователя
    existing_like = db.query(PostLike).filter_by(post_id=post_id, user_id=current_user.id).first()
    if not existing_like:
        raise HTTPException(status_code=400, detail="You haven't liked this post yet")

    # Удаляем лайк
    db.delete(existing_like)
    post.likes -= 1
    db.commit()
    return {"likes": post.likes}


@router.get("/is_post_liked_by_user/{post_id}/")
async def is_post_liked(post_id: int, request: Request, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_active_user)):
    like = db.query(PostLike).filter_by(post_id=post_id, user_id=current_user.id).first()
    return {"isLiked": like is not None}


@router.get("/get_top_posts", response_model=List[PostResponse])
async def get_top_posts(
        count: int = Query(6, ge=1, le=100),  # Количество постов для возврата
        db: Session = Depends(get_db)
):
    """
    Получение самых популярных постов по количеству просмотров.
    Параметры:
    - `count`: Максимальное количество постов (по умолчанию: 6)
    """
    # Считаем количество просмотров через PostView и сортируем
    top_posts = (
        db.query(Post, func.count(PostView.id).label("view_count"))
        .outerjoin(PostView, Post.id == PostView.post_id)  # Левое соединение с PostView
        .group_by(Post.id)  # Группируем по ID поста
        .order_by(func.count(PostView.id).desc())  # Сортируем по количеству просмотров
        .limit(count)  # Ограничиваем количество возвращаемых записей
        .all()
    )

    # Извлекаем только посты из результата
    return [post for post, view_count in top_posts]


@router.get("/relatedposts/{slug:path}")
async def get_related_posts(slug: str, db: Session = Depends(get_db)):
    # Находим текущий пост по slug
    current_post = db.query(Post).filter(Post.slug == slug).first()
    if not current_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Находим похожие посты по категории (исключая текущий пост)
    related_posts = (
        db.query(Post)
        .filter(Post.category == current_post.category, Post.slug != slug)
        .limit(5)
        .all()
    )

    # Возвращаем результат
    return {
        "current_post": {
            "title": current_post.title,
            "slug": current_post.slug,
            "category": current_post.category,
            "content": current_post.body,
        },
        "related_posts": [
            {"title": post.title, "slug": post.slug, "category": post.category, "image": post.main_image}
            for post in related_posts
        ],
    }


@router.post("/increment_views/{post_id}/")
async def increment_views(post_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Увеличение количества просмотров для поста с учетом уникального IP-адреса.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    ip_address = request.client.host
    one_hour_ago = datetime.now() - timedelta(hours=1)

    # Проверяем, был ли уже просмотр с этого IP-адреса за последний час
    existing_view = db.query(PostView).filter(
        PostView.post_id == post_id,
        PostView.ip_address == ip_address,
        PostView.timestamp >= one_hour_ago
    ).first()

    if existing_view:
        return {"message": "View already counted in the last hour"}

    # Добавляем новую запись просмотра
    new_view = PostView(post_id=post_id, ip_address=ip_address, timestamp=datetime.now())
    db.add(new_view)
    db.commit()

    return {"views": len(post.views)}  # Возвращаем количество просмотров
