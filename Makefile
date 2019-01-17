##
VERSION=$(shell node -p "require('./package.json').version")

## Compile module
DOCKER_IMAGE=teltonika-node
DOCKER_TAG=unstable

DOCKER_DOCKERHUB_IMAGE=vingps/teltonika-node
DOCKER_DOCKERHUB_TAG=$(DOCKER_TAG)

DOCKER_AMAZON_IMAGE=091879517775.dkr.ecr.us-east-2.amazonaws.com/teltonika-node
DOCKER_AMAZON_TAG=$(DOCKER_TAG)

#GCLOUD_IMAGE=gcr.io/vingps-209012/teltonika-node
#DOCKER_IMAGE=vingps/teltonika-node
#DOCKER_TAG=develop
#PACKAGE_VERSION=`node -p "require('./package.json').version"`
#DOCKER_BASE_FULL=$(DOCKER_IMAGE):$(DOCKER_TAG)

all: build image publish

clean:
	rm -Rf ./dist

build: clean
	#npm run lint
	#npm version --no-git-tag-version patch
	npm run build

test: build
	npm test

image: build

	# make docker image and tag it
	docker build --target production -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_DOCKERHUB_IMAGE):$(DOCKER_DOCKERHUB_TAG)

	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_AMAZON_IMAGE):$(DOCKER_AMAZON_TAG)
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_AMAZON_IMAGE):$(VERSION)


publish: image
	#docker push $(DOCKER_DOCKERHUB_IMAGE):$(DOCKER_DOCKERHUB_TAG)


	aws ecr get-login --no-include-email | /bin/bash -C -
	docker push $(DOCKER_AMAZON_IMAGE):$(DOCKER_AMAZON_TAG)
	docker push $(DOCKER_AMAZON_IMAGE):$(VERSION)
	docker push $(DOCKER_DOCKERHUB_IMAGE):$(DOCKER_DOCKERHUB_TAG)