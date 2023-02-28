const axios = require('axios')
const dupeList = require('./mergeLog.json')
console.log('wtf')

const mergeList = dupeList.map(el => el["Target object id"])
// const mergeList = ['31058551']

let multiple_secondaries_count = 0
let multiple_emails_count  = 0
let proper_merge_count = 0
let needs_enrichment_count = 0
let doubleCheckMultipleEmails = 0

const token = 'pat-na1-0abbcaf6-fd17-4fa5-95bd-f62de0649e2d';

(async function () {
    for(let contact of mergeList){
        
        const secondaryEmail = await findSecondaryEmails( contact )
        
        if( secondaryEmail.exists){

            if( secondaryEmail.onlyOne ){

                const secondaryCompany = await findSecondaryCompanies( contact )
        
                if( secondaryCompany.exists ){

                    if(secondaryCompany.onlyTwo){

                        await unmerge(secondaryEmail.email, secondaryCompany.companyId, secondaryCompany.updatedContactId, secondaryCompany.firstname, secondaryCompany.lastname )

                    }else{

                        await flagHubspot( contact, 'multiple_associations')
                        multiple_secondaries_count++
                        
                    }
        
        
                }else{
                    await flagHubspot( contact, 'proper_merge' )
                    proper_merge_count++
                }
            }else{
                await flagHubspot( contact, 'has_multiple_emails' )
                multiple_emails_count++
            }
        }else{

            await flagHubspot(contact, 'proper_merge')
            proper_merge_count++

        }
        console.log(`needs enrichment: ${needs_enrichment_count}; proper merge: ${proper_merge_count}; multiple secondaries: ${multiple_secondaries_count}; multiple emails: ${multiple_emails_count};;${doubleCheckMultipleEmails}`)
    }
})();


async function findSecondaryEmails(contact){

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    let exists = false
    let onlyOne = false
    let email = ''

    try {
        await wait(500)
        const secondaryEmailData = await axios({
            method: 'get',
            url: `https://api.hubapi.com/contacts/v1/secondary-email/${contact}`,
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log('secondary email data:')
        console.log(secondaryEmailData.data)
        if(secondaryEmailData.data.secondaryEmails.length === 1){
            onlyOne = true
            exists = true
            email = secondaryEmailData.data.secondaryEmails[0]
        }else if(secondaryEmailData.data.secondaryEmails.length > 1){
            exists = true
            doubleCheckMultipleEmails++
        }
    } catch (error) {
        console.log(error.response)
    }
    return {
        exists: exists,
        onlyOne: onlyOne,
        email: email
    }


}

async function findSecondaryCompanies(contact){ 

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    let exists = false
    let onlyTwo = false
    let companyId = ''
    let updatedContactId = ''
    let firstname = ''
    let lastname = ''

    try {
        await wait(500)
        const instanceData = await axios({
            method: 'get',
            url: `https://api.hubapi.com/crm/v3/objects/contacts/${contact}`,
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log(instanceData.data)
        const id = instanceData.data.id
        firstname = instanceData.data.properties.firstname
        lastname = instanceData.data.properties.lastname
        updatedContactId = id

        await wait(500)
        const associationData = await axios({
            method: 'get',
            url: `https://api.hubapi.com/crm/v4/objects/contacts/${id}/associations/companies`,
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log('association data:')
        console.log(associationData.data)
        
        
        let i = 0
        if(associationData.data.results.length === 2){
            const assocMap = {
                primary: '',
                secondary: ''
            }

            for(let association of associationData.data.results){
                console.log(association.associationTypes)
                let primary = false
                for(let type of association.associationTypes){
                    if(type.label === 'Primary'){
                        primary = true
                    }                   
                }
                if(primary){
                    assocMap.primary = associationData.data.results[i].toObjectId
                }else{
                    assocMap.secondary = associationData.data.results[i].toObjectId
                }
                i++
            }
            exists = true
            onlyTwo = true
            companyId = assocMap.secondary

        }else if(associationData.data.results.length > 2){
            exists = true
        }
        
    } catch (error) {
        console.log(error.response)
    }
    return {
        exists: exists,
        onlyTwo: onlyTwo,
        companyId: companyId,
        updatedContactId: updatedContactId,
        firstname: firstname,
        lastname: lastname
    }
}

async function flagHubspot(id, flag){
    console.log(`flagging hubspot contact id: ${id} as ${flag}`)

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    await wait(500)
    const payload = { properties: {} }
    payload.properties[flag] = true

    try {
        const hsRes = await axios({
            method: 'patch',
            url: `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
            data: payload,
            headers: {
                "Authorization" : "Bearer " + token
            }
        })
        console.log(hsRes.data)
    } catch (error) {
        console.log(error.response)
    }
}

async function unmerge(email, companyId, updatedContactId, firstname, lastname){
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    console.log(`removing association to ${companyId} from contact ${updatedContactId},`)
    console.log(`creating new contact with email: ${email}, first name: ${firstname}, last name: ${lastname} and associating to companyID ${companyId}`)
    needs_enrichment_count++
    try {
        await wait(500)
        const removeAssocRes = axios({
            method:'delete',
            url: `https://api.hubapi.com/crm/v4/objects/contacts/${updatedContactId}/associations/companies/${companyId}`,
            headers: {
                "Authorization": "Bearer " + token    
            }
        })
        console.log('remove association call successfully executed')

        await wait(500)
        const removeEmail = await axios({
            method: 'delete',
            url: `https://api.hubapi.com/contacts/v1/secondary-email/${updatedContactId}/email/${email}`,
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log('email remove call successfully made')

        await wait(500)
        const createContactRes = axios({
            method: 'post',
            url: `https://api.hubapi.com/crm/v3/objects/contacts`,
            data: {
                "properties": {
                    "email": email,
                    "needs_enrichment": true,
                    "firstname": firstname,
                    "lastname": lastname
                }
            },
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log(createContactRes.data)
        const newContactId = createContactRes.data.id

        await wait(500)
        const assocCompanyRes = axios({
            method:'put',
            url: `https://api.hubapi.com/crm/v4/objects/contacts/${newContactId}/associations/companies/${companyId}`,
            data: [
                {
                    "associationCategory": "HUBSPOT_DEFINED",
                    "associationTypeId": 1,
                    "label": "Primary"
                },
                {
                    "associationCategory": "HUBSPOT_DEFINED",
                    "associationTypeId": 279,
                    "label": null
                }
              ],
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        console.log(assocCompanyRes.data)

    } catch (error) {
        console.log(error.response)
    }
}

