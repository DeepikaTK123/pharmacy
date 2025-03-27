pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "pharmacymanagement"
    }

    // jijkj

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // namemn

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
                sh 'DOCKER_BUILDKIT=0 docker compose build'
            }
        }

        stage('Cleanup Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Force Cleanup Containers') {
    steps {
        sh 'docker compose down -v || true'
        sh 'docker rm -f $(docker ps -aq --filter name=pharmacymanagement) || true'
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
                    sh 'sleep 10'  
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
