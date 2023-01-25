# TO USER OF SCRIPT: Requires logging in to both gcloud cli and firebase cli
# use gcloud auth login and firebase login to achieve this
# If you lack the permissions to execute all the commands, contact the owner or administrator of this project

# Variables
PROJECT_ID="PROJECT_ID" # EDIT FOR USAGE
BILLING_ACCOUNT="BILLING_ACCOUNT_ID" # EDIT FOR USAGE
REGION="europe-west2"
WEB_APP_NAME="My_awesome_okr_tracker" # EDIT FOR USAGE

# Create project, must specify project-id and use the same for all commands
gcloud projects create $PROJECT_ID

# Enable billing, requires id of billing account and permission to link it
# . gcloud beta billing projects unlink PROJECT-ID  can be used to unlink
gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT

# Add App Engine, required for firestore
gcloud app create --region=$REGION --project=$PROJECT_ID

# Enable App Engine
gcloud services enable appengine.googleapis.com --project=$PROJECT_ID

# Create firestore database
gcloud firestore databases create --project=$PROJECT_ID --region=$REGION

# Enable firebase management api in GCP
gcloud services enable firebase.googleapis.com --project=$PROJECT_ID

# Add firebase project
firebase projects:addfirebase $PROJECT_ID

# Add web app and get the app sdk config. Add sdk config to js file
# The tail -n 1 prints something like this: firebase apps:sdkconfig WEB WEB_APP_IDENTIFIER
firebase apps:create web $WEB_APP_NAME --project $PROJECT_ID | tail -n 1 | bash > firebase_service_config.js

# Get the service account for firebase
gcloud iam service-accounts list --project=$PROJECT_ID | grep -i 'firebase-adminsdk' > tmp.txt && ARRAY=($(cat tmp.txt)) && SDK_EMAIL=${ARRAY[2]}

# Create new private key for firebase service account, downloads the json file to current dir
gcloud iam service-accounts keys create sa_private_key.json \
    --iam-account=$SDK_EMAIL 

# Create a back-up bucket for the project, required for firebase config to run (see readme)
gcloud storage buckets create gs://backup-bucket-okr-654123 --project=$PROJECT_ID --location="europe-west2"

# Now it is time to add the configuration for firebase functions as the readme instructs
# Uses bucket name from command above and the service account file we got when we generated the private key
firebase functions:config:set service_account="$(cat sa_private_key.json)" storage.bucket="backup-bucket-okr-123654" slack.active=false --project $PROJECT_ID

# clean up
rm tmp.txt

