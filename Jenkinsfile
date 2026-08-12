pipeline {
    agent any

    environment {
        IMAGE = 'docker.io/vnit2075/quicktick:2'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vnit2075/QuickTick-Docker-kubernetes-CI-CD.git'
            }
        }

        stage('Build Jar') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Build Image with containerd') {
    steps {
        sh '''
        nerdctl --address /run/containerd/containerd.sock \
        build -t $IMAGE .
        '''
    }
}

stage('Push Image') {
    steps {
        sh '''
        nerdctl --address /run/containerd/containerd.sock \
        push $IMAGE
        '''
    }
}

        stage('Deploy MySQL') {
            steps {
                sh 'kubectl apply -f k8s/secret.yaml'
                sh 'kubectl apply -f k8s/configmap.yaml'
                sh 'kubectl apply -f k8s/mysql-deployment.yaml'
                sh 'kubectl apply -f k8s/mysql-service.yaml'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'kubectl apply -f k8s/deployment.yaml'
                sh 'kubectl apply -f k8s/service.yaml'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'kubectl get pods -o wide'
                sh 'kubectl get svc'
            }
        }
    }
}
