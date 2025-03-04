function fetchAPIs() {
    const accessToken = document.getElementById('accessToken').value;

    fetch('/fetch-apis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayResults(data.apis);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `Error: ${error.message}`;
    });
}

function displayResults(apis) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>API Results:</h2>';

    if (apis && apis.length > 0) {
        const table = document.createElement('table');
        const headerRow = table.insertRow();
        const idHeader = headerRow.insertCell();
        const nameHeader = headerRow.insertCell();
        const policyHeader = headerRow.insertCell(); // Add policy header

        policyHeader.textContent = 'Policy';
        idHeader.textContent = 'ID';
        nameHeader.textContent = 'Name';

        apis.forEach(api => {
            const row = table.insertRow();
            const idCell = row.insertCell();
            const nameCell = row.insertCell();
            const policyCell = row.insertCell();

            idCell.textContent = api.id;
            nameCell.textContent = api.assetId;
            policyCell.textContent = 'Click'; // Keep "Click" for now

            // Add click event listener to the policy cell
            policyCell.addEventListener('click', () => {
                fetchPolicyData(api.id, policyCell); // Pass api.id and the cell
            });
        });

        resultDiv.appendChild(table);
    } else {
        resultDiv.innerHTML += '<p>No APIs found.</p>';
    }
}

function fetchPolicyData(apiId, policyCell) {
    fetch(`/api/policy/${apiId}`)
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            
            if (data.rateLimits) {
                policyCell.textContent = ''; // Clear existing content
                const limitText = `Maximum Requests: ${data.rateLimits.maximumRequests}, Time Period: ${data.rateLimits.timePeriodInMilliseconds}ms`;
                const newLine = document.createElement('br');
                policyCell.appendChild(document.createTextNode(limitText));
                policyCell.appendChild(newLine);
            } else {
                policyCell.textContent = 'No rate limits found';
            }
        })
        .catch(error => {
            console.error('Error fetching policy:', error);
            policyCell.textContent = 'Error fetching policy';
        });
}
