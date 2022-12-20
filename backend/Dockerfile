FROM python:3.10
WORKDIR app
COPY ./requirements.txt /app
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./server /app
COPY ./database /app
EXPOSE 8080
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080"]

#ENV POSTGRES_DB "univer_bd"
#ENV POSTGRES_USER "postgres"
#ENV POSTGRES_PASSWORD "postgres"
#EXPOSE 5432
#WORKDIR db
#COPY ./database /db
#CMD ["psql", "-f", "/db/init.sql"]
#CMD ["psql", "-f", "/db/tables.sql"]
#CMD ["psql", "-f", "/db/functions.sql"]