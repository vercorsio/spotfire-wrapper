#!/bin/sh

which aws 
aws=$?

set -e

if [ $aws -eq 1 ]
then
    echo "CAUTION: aws is not installed on this machine."
    echo "         SpotfireWrapper JS library won't be published at https://s3-us-west-2.amazonaws.com/cec-library/"
    echo "         but in ./build"
    export WORKSPACE=$(PWD)
    mkdir -p ${WORKSPACE}/build
else
    export AWS_DEFAULT_PROFILE=cec
    date
    pwd
    env | sort
fi

repl() { printf -- "$1"'%.s' $(eval "echo {1.."$(($2))"}"); }
title() {
    title=$1
    echo ""
    echo "=========================================================================================="
    echo $title
    repl "- " $((${#title}/2+1))
    echo ""
}
rm -rf node_modules/\@tibco node_modules/spotfire-w*

title "Install dependencies:"
npm install


title "[spotfire-webplayer] Build the NPM package:"
#./node_modules/.bin/ng build spotfire-webplayer
# https://nitayneeman.com/posts/making-an-addable-angular-package-using-schematics/
npm run build-package

if [ "$HOSTNAME" = "rcxxxxbld12" ]
then
    title "[spotfire-webplayer] Publish the NPM package to artifacts.tibco.com:"

    # trick to be logged as jenkins to verdaccio (to publich spotfire-wrapper NPM package)
    echo "## DO NOT MODIFY !! (Nicolas Deroche - March 2019) ##" > ~/.npmrc
    echo "## This script is generated by script build.sh (cf Jenkins job UI_SpotfireWrapper_Develop)"  >> ~/.npmrc
    curl -ureward-deployment:AP8V7oMPFGgtE2eZFMPC2mEHMjfNN7PyUvRa3h "http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general/auth/tibco" >> ~/.npmrc
    (cd dist/spotfire-wrapper ; npm publish --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general --access public)
else
    find dist
    title "[spotfire-webplayer] Create the NPM package:"
    (cd dist/spotfire-wrapper/ ; npm pack)
    title "[spotfire-webplayer] Copy the NPM package to local build directory:"
    cp -f ${WORKSPACE}/dist/spotfire-wrapper/*.tgz ${WORKSPACE}/build/spotfire-wrapper.tgz
fi

title "[spotfire-wrapper] Install the NPM package from NPM registry"
echo "The NPM package is used to build the WebElement Library"
npm install @tibco/spotfire-wrapper --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general --no-save || {
    echo "WARNING: no access to artifacts.tibco.com NPM registry - Trying to install it from ${WORKSPACE}/build/spotfire-wrapper.tgz"
    npm install ${WORKSPACE}/build/spotfire-wrapper.tgz --no-save
}

title "[spotfire-wrapper] Build the WebElement Library:"
npm run build:elements

if [ $aws -eq 0 ]
then
    title "[spotfire-wrapper] Copy the WebElement Library to S3:"
    aws s3 cp elements/spotfire-wrapper.js s3://cec-library/
else
    cp -f elements/spotfire-wrapper.js ${WORKSPACE}/build/
fi

echo ""
echo ""
echo "How to use: "
echo "  - npm config set @tibco:registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general"
echo "    npm install @tibco/spotfire-wrapper@latest --save"
echo "  OR"
echo "  - npm install @tibco/spotfire-wrapper@latest --save @tibco:registry --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general"
echo ""
echo "  - <script src='https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js'></script>"
echo ""
echo ""
[ $aws -eq 1 ] && ls -lrt ${WORKSPACE}/build/
echo ""
echo "Done!"

