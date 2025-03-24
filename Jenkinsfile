pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "pharmacymanagement"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }

        stage('Stop Existing Containers') {
            steps {
                echo '🛑 Stopping and removing old containers...'
                sh 'docker-compose down --volumes || true'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🔨 Building frontend and backend images...'
                sh 'docker-compose build'
            }
        }

        stage('Start Service') {
            steps {
                echo '🚀 Starting services...'
                sh 'docker-compose up -d'
            }
        }

        stage('Verify Running Containers') {
            steps {
                echo '🔍 Showing running containers...'
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed. Check logs above.'
        }
    }
}
