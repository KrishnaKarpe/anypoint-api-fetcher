require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());


app.get('/api/policy/:apiId', async (req, res) => {
    const apiId = req.params.apiId;
    const accessToken = process.env.KK;
    const organizationId = process.env.ORGANIZATION_ID;
    const environmentId = process.env.ENVIRONMENT_ID;

    try {
        const response = await axios.get(
            `https://anypoint.mulesoft.com/apimanager/api/v1/organizations/${organizationId}/environments/${environmentId}/apis/${apiId}/policies`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        // console.log(response.data);
        const rateLimits1 = response.data.policies.find(policy => policy.policyTemplateId === '348741');
        // console.log(rateLimits1.configuration.rateLimits);
        if (rateLimits1 && rateLimits1.configuration && rateLimits1.configuration.rateLimits) {
            const rateLimits = rateLimits1.configuration.rateLimits;
            console.log(rateLimits);
            res.json({ rateLimits: rateLimits });
        } else {
            res.status(404).json({ message: 'Policy not found or does not have rate limits' });
        }
    } catch (error) {
        console.error('Error fetching policy:', error);
        res.status(500).send('Error fetching policy');
    }
});


app.post('/fetch-apis', async (req, res) => {
    const { accessToken } = req.body;
    const organizationId = process.env.ORGANIZATION_ID;
    const environmentId = process.env.ENVIRONMENT_ID;

    try {
        const response = await axios.get(
            `https://anypoint.mulesoft.com/apimanager/api/v1/organizations/${organizationId}/environments/${environmentId}/apis`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        // Extract the relevant data from the response
        const apiData = response.data.assets.flatMap(asset => asset.apis); // Flatten the array

        res.json({ apis: apiData });
    } catch (error) {
        console.error('Error fetching APIs:', error.message);
        res.status(500).json({ error: 'Failed to fetch APIs' });
    }
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});