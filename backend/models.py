# models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, UniqueConstraint, ARRAY, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import slugify
import uuid  # Добавляем импорт для uuid


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    posts = relationship("Post", back_populates="author")
    liked_posts = relationship("PostLike", back_populates="user")
    followers = relationship("Follow", foreign_keys='Follow.followed_id', back_populates="followed")
    following = relationship("Follow", foreign_keys='Follow.follower_id', back_populates="follower")
    profile_image = Column(String, nullable=True)  # profile image


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    body = Column(String)
    date = Column(DateTime, default=datetime.now, nullable=False)  # Добавление даты
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")
    tags = Column(JSON, nullable=True)
    category = Column(String, index=True, nullable=False)

    slug = Column(String, unique=True, index=True)  # Уникальная ссылка (slug)
    main_image = Column(String, nullable=True)  # Главная картинка (URL или путь к изображению)
    likes = Column(Integer, default=0)  # Количество лайков
    comments = relationship("PostComment", back_populates="post")  # Связь с отзывами
    liked_by = relationship("PostLike", back_populates="post")

    views = relationship("PostView", back_populates="post", cascade="all, delete-orphan")

    @staticmethod
    def generate_slug():
        current_date = datetime.now().strftime("%d/%m/%y")  # Форматируем текущую дату
        return f"{current_date}/{str(uuid.uuid4())[:32]}"  # Генерируем уникальный slug

    @property
    def views_count(self):
        return len(self.views)  # Возвращает количество связанных записей


class PostView(Base):
    __tablename__ = "post_views"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))
    ip_address = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.now)

    post = relationship("Post", back_populates="views")


class PostComment(Base):
    __tablename__ = "postcomments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    body = Column(String)
    date = Column(DateTime, default=datetime.now)

    post = relationship("Post", back_populates="comments")
    author = relationship("User")


class PostLike(Base):
    __tablename__ = "post_likes"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    post = relationship("Post", back_populates="liked_by")
    user = relationship("User", back_populates="liked_posts")


class Follow(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    followed_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    date = Column(DateTime, default=datetime.now)

    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    followed = relationship("User", foreign_keys=[followed_id], back_populates="followers")

    __table_args__ = (
        UniqueConstraint('follower_id', 'followed_id', name='unique_follow'),
    )


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String)
    description = Column(String)
    link = Column(String)
    date = Column(DateTime, default=datetime.now)

    user = relationship("User")
