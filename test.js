// const axios = require('axios')

// const microsoftId = '59c00a43-6bbd-4356-8c4d-b9a8ec3c82b7'
// const partnerId = 'BDF/lZQIQhlF3+cAL96a9CXBW47/fwA64d3YqY2O9us=	'
// const bemoId = '2db28860-cd01-46ae-8fe4-20542598cafe'

// main()

// async function main(){
//     try{
//         const res = await axios({
//             method: 'post',
//             url: `https://login.microsoftonline.com/59c00a43-6bbd-4356-8c4d-b9a8ec3c82b7/oauth2/token`,
//             data: {
//                 "grant_type": "client_credentials",
//                 "client_secret": "BDF/lZQIQhlF3+cAL96a9CXBW47/fwA64d3YqY2O9us=",
//                 "client_id": "2db28860-cd01-46ae-8fe4-20542598cafe",
//                 "resource": "https://graph.windows.net"
//             },
//             headers: {
//                 "Accept": "application/json",
//                 "return-client-request-id": "true",
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Host": "login.microsoftonline.com",
//                 "Content-Length": "194",
//                 "Expect": "100-continue"
//               }
//         })
//         console.log(res)
//     }catch(err){

//         console.log(err.response)
//         console.log(Object.keys(err))
        
//     }
// }

var axios = require('axios');
var FormData = require('form-data');
var data = new FormData();
data.append('resource', 'https://graph.windows.net');
data.append('client_id', '2db28860-cd01-46ae-8fe4-20542598cafe');
data.append('client_secret', 'BDF/lZQIQhlF3+cAL96a9CXBW47/fwA64d3YqY2O9us=');
data.append('grant_type', 'client_credentials');

var config = {
  method: 'post',
  url: 'https://login.microsoftonline.com/59c00a43-6bbd-4356-8c4d-b9a8ec3c82b7/oauth2/token',
  headers: { 
    'Cookie': 'fpc=Ai3xkjbaFcZIgf97pOvJyI1j4KCdAQAAAIBTf9sOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd', 
    ...data.getHeaders()
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

