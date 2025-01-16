from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import NotificationResponse, NotificationBase
from ..models import Notification, User
from typing import List
from ..auth.auth_handler import get_current_active_user
from ..hooks.websocket import notify_users_update


router = APIRouter()


@router.get("/get_notifications/", response_model=List[NotificationResponse])
async def get_notifications(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Получить уведомления для текущего пользователя.
    """
    # Получаем уведомления для текущего пользователя
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.date.desc()).all()

    return notifications


@router.delete("/clear_notifications", status_code=204)
async def clear_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Удалить все уведомления текущего пользователя.
    """
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Notifications cleared successfully"}


@router.post("/create_notification/")
async def create_notification(
    notification_data: NotificationBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = Notification(**notification_data.dict(), user_id=current_user.id)
    db.add(notification)
    db.commit()
    await notify_users_update()
    return notification
