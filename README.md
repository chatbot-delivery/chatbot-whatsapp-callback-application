# WhatsApp Platform Quick Start

Welcome to your first step toward building awesome WhatsApp apps!

This project contains the code for a simple webhook you can use to get started using the WhatsApp Platform.

The code here mirrors what is in our [webhook set up guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks), and may be used as the starting point for doing the ["Get Started With the WhatsApp Business Cloud API guide"](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/).

## Additional Resources

Interested in learning more about the WhatsApp Platform?

Check out these resources:

- [**Webhook set up guide**](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/#configure-webhooks): The walkthrough for the code in this project.

- [**Quick start tutorial**](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/): Build your first app by remixing this project and following our quick start tutorial.

- [**WhatsApp Business Platform Documentation**](https://developers.facebook.com/docs/whatsapp/)



## Infra Deployment Steps

** Infra Deployment
set RESOURCE_GROUP_NAME=RG-FedExEurope_DeliveryBot
set APP_SERVICE_PLAN_NAME=asp-chatbot-whatsapp-callback-application
set APP_SERVICE_NAME=chatbot-whatsapp-callback-application
set LOCATION="westeurope"
set LOG_ANALYTICS_WORKSPACE="chatbot-whatsapp-callback-application-workspace"
set APP_INSIGHTS_NAME="chatbot-whatsapp-callback-application-app"

az appservice plan create --name %APP_SERVICE_PLAN_NAME% --resource-group %RESOURCE_GROUP_NAME% --location %LOCATION% --sku B1 

az webapp create --name %APP_SERVICE_NAME% --resource-group %RESOURCE_GROUP_NAME% --plan %APP_SERVICE_PLAN_NAME% --runtime "NODE:16-lts"

az webapp log config --application-logging filesystem --detailed-error-messages true --failed-request-tracing true --resource-group %RESOURCE_GROUP_NAME%  --name %APP_SERVICE_NAME% --level verbose --web-server-logging filesystem

az monitor log-analytics workspace create --resource-group %RESOURCE_GROUP_NAME% -n %LOG_ANALYTICS_WORKSPACE%

az monitor app-insights component create --app %APP_INSIGHTS_NAME% --location %LOCATION% --kind web --resource-group %RESOURCE_GROUP_NAME% --application-type web --workspace %LOG_ANALYTICS_WORKSPACE%

az webapp config appsettings set --name %APP_SERVICE_NAME% --resource-group %RESOURCE_GROUP_NAME% --settings APPINSIGHTS_INSTRUMENTATIONKEY=2bd6a60f-e883-4970-8b7f-ea3e3a54cc8e APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=2bd6a60f-e883-4970-8b7f-ea3e3a54cc8e VERIFY_TOKEN=hello WHATSAPP_TOKEN=EABOVkywGH6UBANM72Lnt5ocQs42p1Ja0BvwGJP98vkLhiShuzOY1uQ6LlHjl5EOVf1OR86tajOZCsm6DRrG2KEYdaMPLYi7PU4t0MdmZAMNQqxlxZBfhtE2Te1PtNZAR37RQawAyyZC2Hd1jxlVVVWWTXsK5dZBkgLZBqOLow9OWZBDLW170TlCf5YBhjFp5VNd2ge9VuQB1gAZDZD AZURE_BOT_SECRET=qaZW2T0UAP4.69lYmshpdJqGGS5l-7OHFmpJ3sAU0M3XTncMRnY6UQk ApplicationInsightsAgent_EXTENSION_VERSION=~2

** Code Deployment   
 Deployment Via CICD (GitHub Actions)
 
 ** Application Urls
 https://chatbot-p4ebackend.azurewebsites.net/v1/pickuppoints?trackingId=121313&language=en
 https://chatbot-p4ebackend.azurewebsites.net/v1/deliverydates?trackingId=121313&language=en
 https://chatbot-p4ebackend.azurewebsites.net/v1/notification/delivery?userId=saroj