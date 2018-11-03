## Compile module
DOCKER_IMAGE=teltonika-node
DOCKER_TAG=stable

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
	npm run build

test: build
	npm test

image: build
	# make docker image and tag it
	docker build --target production -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_DOCKERHUB_IMAGE):$(DOCKER_DOCKERHUB_TAG)
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_AMAZON_IMAGE):$(DOCKER_AMAZON_TAG)

publish: image
	#docker push $(DOCKER_DOCKERHUB_IMAGE):$(DOCKER_DOCKERHUB_TAG)
	docker push $(DOCKER_AMAZON_IMAGE):$(DOCKER_AMAZON_TAG)
