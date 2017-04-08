from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

Column, Text, Integer, Float = db.Column, db.Text, db.Integer, db.Float

class Us(db.Model):
    __tablename__='us'

    country_code=Column(Text)
    postal_code=Column(Text)
    place_name=Column(Text)
    admin_name1=Column(Text)
    admin_code1=Column(Text)
    admin_name2 = Column(Text)
    admin_code2 = Column(Text)
    admin_name3 = Column(Text)
    admin_code3 = Column(Text)
    latitude=Column(Float)
    longitude=Column(Float)
    accuracy=Column(Integer)
    id=Column(Integer, primary_key=True)