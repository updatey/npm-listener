#!/bin/bash
TAG=$(date +%s)
docker build -t gcr.io/updateyapp/npmlistener:$TAG .
docker push gcr.io/updateyapp/npmlistener:$TAG
kubectl set image deployment npm-listener npm-listener=gcr.io/updateyapp/npmlistener:$TAG
kubectl rollout status deployment npm-listener
