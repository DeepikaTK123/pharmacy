# Use an official Python runtime as a parent image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# # Upgrade pip before installing requirements
# RUN pip install --upgrade pip setuptools wheel

# Install any needed packages specified in requirements.txt

RUN pip install -r requirements.txt --default-timeout=100 --retries=5

# RUN pip install -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run run.py when the container launches
CMD ["python", "run.py"]
