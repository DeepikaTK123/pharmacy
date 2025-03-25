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
                sh 'docker compose version'
            }
        }

        stage('Free Port 5000') {
            steps {
                sh '''
                    PID=$(lsof -t -i:5000 || true)
                    if [ ! -z "$PID" ]; then
                        echo "Port 5000 is in use by PID $PID. Killing it..."
                        kill -9 $PID || true
                    fi
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
                sh '''
                    docker compose down -v || true
                    containers=$(docker ps -aq --filter name=pharmacymanagement)
                    if [ ! -z "$containers" ]; then
                        docker rm -f $containers || true
                    fi
                '''
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
                    timeout(time: 60, unit: 'SECONDS') {
                        waitUntil {
                            def result = sh(script: "docker compose exec backend curl -s http://localhost:5000/health || true", returnStdout: true).trim()
                            return result.contains("OK") || result.contains("healthy")
                        }
                    }
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

    post {
        always {
            sh 'docker compose down || true'
        }
    }
}
