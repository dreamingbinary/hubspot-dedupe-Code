Dedupe Code

Set up:
1. on the index.js file line 18, modify the string to be either "contacts" or "companies" depending on which object you are working on
2. On the same file modify the array to select which properties you want to search for duplicates on. Make sure the property or properties are the hubspot internal values for the properties. You can view these in the property editor in hubspot
3. Proceed to run the code


Run the code: 
1. run "npm install"
2. run "node index"
3. Select yes to create new database if you are running the code for the first time
4. Once prompted, select yes to continue to the find duplicates on
5. Hit ctrl+c to exit the script once all activity in the terminal has stopped.
6. Run "node analyze_contacts" or "node analyze_companies" to begin merging contacts

files created by the process:
-Once node index has finished creating the database and looking for duplicates, you can view the duplicates found in the "contacts_dupes.json" or "companies_dupes.json". This is a big array of arrays where each subarray is a duplicate pair. Review this to make sure the duplicates found are what you are expecting
-Once the analyze scripts are finished running you can view the pairs that were merged based on the criteria in those javascript files. These pairs are stored in the following json files as pairs where the second of each of subelement represents the duplicate record that was merged:
    For contacts:
        -date.json (pairs merged by which object was created first)
        -sa.json (pairs merged by which object had more sales activity)
        -deals.json (pairs merged by which had more deals associated with them)
    For compaines:
        -dates_dupes.json
        -contacts_dupes.json
        -deals_dupes.json
    