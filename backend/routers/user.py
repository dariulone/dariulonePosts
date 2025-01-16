from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..auth.auth_handler import get_current_active_user
from ..models import Post, User, PostComment, PostLike, Notification, Follow
from ..schemas import PostCreate, PostResponse, CommentCreate, PostCommentBase, UserResponse, UserResponseWithFollow, \
    FollowResponse, FollowCreate, NotificationBase, NotificationResponse, UpdateUserProfile
from ..database import get_db
from typing import List, Optional
from ..hooks.websocket import notify_users_update
from async_lru import alru_cache

router = APIRouter()


@alru_cache(ttl=120)
@router.get("/users/me/", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    if current_user is None:
        raise HTTPException(
            status_code=401, detail="Not authenticated"
        )
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        profile_image=current_user.profile_image
    )


@router.get("/users/{user_id}", response_model=UserResponseWithFollow)
async def get_user_profile(
        user_id: int,
        current_user: Optional[User] = Depends(get_current_active_user),  # Сделано опциональным
        db: Session = Depends(get_db)
):
    # Получаем пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверяем подписку только для авторизованных пользователей

    # Считаем количество подписчиков
    followers_count = db.query(Follow).filter(Follow.followed_id == user_id).count()

    # Считаем количество подписок
    following_count = db.query(Follow).filter(Follow.follower_id == user_id).count()

    # Формируем ответ
    return UserResponseWithFollow(
        id=user.id,
        username=user.username,
        email=user.email if current_user else None,
        followers_count=followers_count,
        following_count=following_count,
        profile_image=user.profile_image
    )


@router.post("/users/{user_id}/follow", response_model=FollowResponse)
async def follow_user(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    # Нельзя подписаться на самого себя
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    # Проверяем, подписан ли уже пользователь
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()
    if existing_follow:
        raise HTTPException(status_code=400, detail="Already following this user")

    # Создаем запись о подписке
    follow = Follow(follower_id=current_user.id, followed_id=user_id)
    db.add(follow)
    db.commit()
    db.refresh(follow)

    # Загружаем связанные объекты для ответа
    follower = db.query(User).filter(User.id == follow.follower_id).first()
    followed = db.query(User).filter(User.id == follow.followed_id).first()

    # Создаем уведомление для пользователя, на которого подписались
    notification = Notification(
        user_id=user_id,
        title="Новый подписчик",
        description=f"{current_user.username} подписался на Вас.",
        link=f"/profile/{current_user.id}",
    )
    db.add(notification)
    db.commit()

    await notify_users_update()

    # Формируем и возвращаем ответ
    return FollowResponse(
        id=follow.id,
        follower=UserResponse.from_orm(follower),
        followed=UserResponse.from_orm(followed),
        date=follow.date
    )


# Маршрут для отписки от пользователя
@router.post("/users/{user_id}/unfollow", response_model=FollowResponse)
async def unfollow_user(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    # Нельзя отписаться от самого себя
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")

    # Проверяем, есть ли подписка
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()

    if not follow:
        raise HTTPException(status_code=400, detail="Not following this user")

    # Удаляем запись о подписке
    db.delete(follow)
    db.commit()

    follower = db.query(User).filter(User.id == follow.follower_id).first()
    followed = db.query(User).filter(User.id == follow.followed_id).first()

    # Формируем и возвращаем ответ
    return FollowResponse(
        id=follow.id,
        follower=UserResponse.from_orm(follower),
        followed=UserResponse.from_orm(followed),
        date=follow.date
    )


# Маршрут для проверки подписки
@router.get("/users/{user_id}/is_following", response_model=bool)
async def check_following(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    # Пользователь не может быть подписан сам на себя
    if current_user.id == user_id:
        return False

    # Проверяем наличие подписки
    is_following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first() is not None

    return is_following


@router.put("/update/user/me", response_model=UpdateUserProfile)
async def update_user_profile(
    data: UpdateUserProfile,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Обновление данных пользователя
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = data.username
    user.email = data.email
    user.profile_image = data.profile_image

    db.commit()
    db.refresh(user)

    return user
