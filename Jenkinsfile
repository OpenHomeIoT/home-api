pipeline {
  agent {
    docker {
      image "node:12"
      args "-u root:root"
    }
  }

  environment {
    CI = 'true'
  }

  stages {
    stage("Install") {
      steps {
        sh "npm install"
      }
    }

    stage("Build") {
      steps {
        sh "npm run build:prod"
      }
    }
  }
}
