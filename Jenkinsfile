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

        stage('Check Docker Compose Version') {
            steps {
                sh '''
                    docker compose version
                '''
            }
        }

     
        stage('Check Docker') {
            steps {
                sh 'docker --version && docker compose version'
            }
        }
    

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Cleanup Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Run Services') {
            steps {
                sh 'docker compose up -d --remove-orphans --force-recreate'
            }
        }

        stage('Wait for Backend to Be Ready') {
            steps {
                script {
                    sh 'sleep 10'  // Replace with healthcheck logic later
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh 'docker compose exec backend pytest || true'
            }
        }

        stage('Tear Down') {
            steps {
                sh 'docker compose down'
            }
        }
    }
}
