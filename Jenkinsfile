pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "pharmacymanagement"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('docker-compose') {
            steps {
                sh '''which docker-compose
                docker-compose --version
                '''
            }
        }


        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Services') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Wait for Backend to Be Ready') {
            steps {
                script {
                    sh 'sleep 10'  // Better to use a health check in production
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh 'docker exec pharmacymanagement-backend-1 pytest'
            }
        }

        // Optional: Stop containers after test
        stage('Tear Down') {
            steps {
                sh 'docker-compose down'
            }
        }
    }
}
