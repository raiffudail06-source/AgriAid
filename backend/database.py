# backend/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# Create database engine
engine = create_engine("sqlite:///agriaid.db", echo=False)

# Base class for tables
Base = declarative_base()

# Table: Analysis (stores AI results)
class Analysis(Base):
    __tablename__ = "analysis"
    id = Column(Integer, primary_key=True)
    image_name = Column(String(120))
    disease = Column(String(120))
    confidence = Column(Float)
    solution = Column(String(300))
    concern = Column(String(300))
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables (only runs once)
Base.metadata.create_all(engine)

# Session setup
Session = sessionmaker(bind=engine)
session = Session()

# Helper function to add a new analysis record
def save_analysis(image_name, disease, confidence, solution, concern):
    record = Analysis(
        image_name=image_name,
        disease=disease,
        confidence=confidence,
        solution=solution,
        concern=concern
    )
    session.add(record)
    session.commit()
    return record.id

# Helper function to fetch all analyses (for history page later)
def get_all_records():
    return session.query(Analysis).order_by(Analysis.timestamp.desc()).all()
