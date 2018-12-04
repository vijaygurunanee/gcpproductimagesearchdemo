# Product Search through Image search using google-cloud-vision-api
This project is a demo for product search using vision-api of google-cloud. This project is built using nodejs and expressjs.

## Getting Started
I have checked-in related npm packages with this repo (not sure if i should do this but will remove it if i will work on it). so, most part to run this project is

#### on google-cloud
* create a google-cloud account
* create a bucket
* enable vision-api
* genearte the auth key for vision-api
* for more information on this, visit [Google Cloud Product Search Tutorial](https://cloud.google.com/vision/product-search/docs/tutorial-search-merged)

#### on local
* install nodejs
* install google-cloud-vision-api-library
* download the project
* modify the details related to google-cloud in configuration js
* open console (or open project with some code editor)
* run using 'npm start' or the code editor

Product-images will be stored at two places: on bucket and on local. If we start optimizing this project, then there are many enhancements possible. Currently, google-search results are good but not that much effective. we can optimize them by applying one more level of some kind of filtering. (like feature extraction of AWS image-rekognization gives us details of image).

### Note
This is just a demo. so,
* i haven't done much refactoring (today).
* This is not suitable code for prod.
* I haven't even captured test cases.
* images are saved locally

