from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'safehaven-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ContactLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrustedContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrustedContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: Optional[str] = None
    sent_to: List[str] = []

class AlertCreate(BaseModel):
    location: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

def send_alert_email(recipient_email: str, recipient_name: str, user_name: str, location: str = None):
    """Send emergency alert email"""
    sendgrid_key = os.environ.get('SENDGRID_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'noreply@safehaven.com')
    
    if not sendgrid_key:
        logging.warning("SendGrid API key not configured")
        return False
    
    subject = "🚨 ALERTA DE EMERGÊNCIA - SafeHaven"
    
    location_text = f"<p><strong>Localização:</strong> {location}</p>" if location else ""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; border-left: 5px solid #dc2626;">
                <h1 style="color: #dc2626; margin-top: 0;">🚨 ALERTA DE EMERGÊNCIA</h1>
                <p style="font-size: 16px; line-height: 1.6;">
                    Olá {recipient_name},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                    <strong>{user_name}</strong> enviou um alerta de emergência através do SafeHaven.
                </p>
                {location_text}
                <p style="font-size: 16px; line-height: 1.6; color: #dc2626; font-weight: bold;">
                    Por favor, entre em contato imediatamente!
                </p>
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
                <p style="font-size: 14px; color: #666;">
                    Enviado em: {datetime.now(timezone.utc).strftime('%d/%m/%Y às %H:%M:%S')} UTC<br>
                    Este é um alerta automático do sistema SafeHaven.
                </p>
            </div>
        </body>
    </html>
    """
    
    try:
        message = Mail(
            from_email=sender_email,
            to_emails=recipient_email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        logging.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False

# Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create user
    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hashed_pw
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Generate token
    token = create_access_token({"sub": user.id})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    # Convert datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    
    # Generate token
    token = create_access_token({"sub": user.id})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/contacts", response_model=TrustedContact)
async def create_contact(contact: TrustedContactCreate, user_id: str = Depends(get_current_user)):
    trusted_contact = TrustedContact(
        user_id=user_id,
        name=contact.name,
        email=contact.email,
        phone=contact.phone
    )
    
    contact_dict = trusted_contact.model_dump()
    contact_dict['created_at'] = contact_dict['created_at'].isoformat()
    
    await db.trusted_contacts.insert_one(contact_dict)
    return trusted_contact

@api_router.get("/contacts", response_model=List[TrustedContact])
async def get_contacts(user_id: str = Depends(get_current_user)):
    contacts = await db.trusted_contacts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    for contact in contacts:
        if isinstance(contact['created_at'], str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, user_id: str = Depends(get_current_user)):
    result = await db.trusted_contacts.delete_one({"id": contact_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    return {"message": "Contato removido com sucesso"}

@api_router.post("/alerts/send", response_model=Alert)
async def send_alert(alert_data: AlertCreate, user_id: str = Depends(get_current_user)):
    # Get user info
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Get trusted contacts
    contacts = await db.trusted_contacts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    if not contacts:
        raise HTTPException(status_code=400, detail="Nenhum contato de confiança cadastrado")
    
    # Send emails to all contacts
    sent_to = []
    for contact in contacts:
        success = send_alert_email(
            recipient_email=contact['email'],
            recipient_name=contact['name'],
            user_name=user_doc['name'],
            location=alert_data.location
        )
        if success:
            sent_to.append(contact['email'])
    
    # Save alert
    alert = Alert(
        user_id=user_id,
        location=alert_data.location,
        sent_to=sent_to
    )
    
    alert_dict = alert.model_dump()
    alert_dict['timestamp'] = alert_dict['timestamp'].isoformat()
    
    await db.alerts.insert_one(alert_dict)
    return alert

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(user_id: str = Depends(get_current_user)):
    alerts = await db.alerts.find({"user_id": user_id}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    
    for alert in alerts:
        if isinstance(alert['timestamp'], str):
            alert['timestamp'] = datetime.fromisoformat(alert['timestamp'])
    
    return alerts

@api_router.delete("/user/clear")
async def clear_user_data(user_id: str = Depends(get_current_user)):
    await db.trusted_contacts.delete_many({"user_id": user_id})
    await db.alerts.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    return {"message": "Todos os dados foram removidos com sucesso"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()