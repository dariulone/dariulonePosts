# schemas.py

from datetime import datetime
from pydantic import BaseModel, field_validator, validator
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    profile_image: Optional[str] = None


class UpdateUserProfile(BaseModel):
    username: str
    email: str
    profile_image: str  # Base64 кодированное изображение


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


class UserInDB(UserResponse):
    hashed_password: str


class FollowBase(BaseModel):
    follower_id: int
    followed_id: int


class FollowCreate(FollowBase):
    pass


class FollowResponse(BaseModel):
    id: int
    follower: UserResponse
    followed: UserResponse
    date: Optional[datetime] = None

    def __init__(self, **data):
        super().__init__(**data)
        if not self.date:
            self.date = datetime.now()

    class Config:
        orm_mode = True
        from_attributes = True


class UserResponseWithFollow(UserResponse):
    followers_count: int
    following_count: int

    class Config:
        orm_mode = True


class PostBase(BaseModel):
    title: str
    body: str

    @field_validator("title", mode="before")
    def validate_title(cls, value):
        if isinstance(value, dict):
            # Если title — это словарь, извлекаем значение
            return value.get("title", "")
        if not isinstance(value, str):
            raise ValueError("Title must be a string")
        return value


class PostCommentBase(BaseModel):
    body: str
    author: UserResponse
    date: Optional[datetime] = None

    def __init__(self, **data):
        super().__init__(**data)
        if not self.date:
            self.date = datetime.now()

    class Config:
        orm_mode = True


class CommentCreate(BaseModel):
    body: str


class PostResponse(PostBase):
    id: int
    author: UserResponse
    date: Optional[datetime] = None
    slug: str
    main_image: Optional[str]
    likes: int = 0
    views_count: int  # Количество просмотров
    comments: List[PostCommentBase] = []
    tags: List[str] = []  # Список тегов
    category: str


    def __init__(self, **data):
        super().__init__(**data)
        if not self.date:
            self.date = datetime.now()

    class Config:
        orm_mode = True


class PostCreate(PostBase):
    main_image: Optional[str]
    tags: Optional[List[str]] = None  # Необязательный список строк
    category: str

    @validator('tags', pre=True, always=True)
    def default_tags(cls, v):
        return v or []


class NotificationBase(BaseModel):
    title: str
    description: str
    link: str


class NotificationResponse(NotificationBase):
    id: int
    date: Optional[datetime] = None

    def __init__(self, **data):
        super().__init__(**data)
        if not self.date:
            self.date = datetime.now()

    class Config:
        orm_mode = True
