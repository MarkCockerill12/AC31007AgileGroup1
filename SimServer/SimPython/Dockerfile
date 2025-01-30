FROM python:3.9
WORKDIR /app
COPY ./SimServerChanged.py /app/SimServerChanged.py
RUN pip install pymysql mysql-connector-python
EXPOSE 31007
CMD ["python", "SimServerChanged.py"]
