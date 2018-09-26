#!/usr/bin/env bash

docker run -v MapImages:/data --name helper busybox true
docker cp ./MapImages/blank.png helper:/data
docker rm helper
docker volume create NpcImages
docker volume create KirjaFiles
docker volume create ItemImages
docker volume create TaskImages
docker volume create SkillImages