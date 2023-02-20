const axios = require('axios')

const main = async (duplicate, object, token) => {
    console.log(`merging duplicate ${object}: ${duplicate[1]} with original: ${duplicate[0]}`)

    try {
        const mergeStatus = await axios({
            method: 'POST',
            url: `https://api.hubapi.com/crm/v3/objects/${object}/merge`,
            data: {
                "primaryObjectId": duplicate[0],
                "objectIdToMerge": duplicate[1]
              },
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        if(mergeStatus.data.id){
            console.log(`merge successful into record: ${mergeStatus.data.id}`)
        }
    } catch (error) {
        console.log(error.response.status)
    }

    return 'ok'
}

module.exports = main