import axios from 'axios';
import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

// Note : Using deprecated location query parameter. Need to change to lat;lon or geocoding API instead.
const queryLocation = 'Paris, France';

const instance = axios.create({
    baseURL: 'https://api.openweathermap.org/data/2.5',
    params: {
        'appid': process.env.OWM_KEY,
        'q': queryLocation,
        'units': 'metric',
        'lang': 'fr'
    }
});

// Check if DynamoDB Table Name is set in env vars
if (!process.env.TABLE_NAME) {
    throw new Error("TABLE_NAME env var is missing");
}

// Provide default headers for CORS response
const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type"
};


// Function to retrieve weather data from DynamoDB
const freshness = 3600 // 1 hour
const TableName: string = process.env.TABLE_NAME;
const retrieveFromDb = async (city: string) => {
    const client = new DynamoDBClient();
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: 'city = :city',
        ExpressionAttributeValues: {
            ':city': {
                'S': city
            }
        }
    });
    return await client.send(command);
};

export { retrieveFromDb };

const storeInDb = async (city: string, data: any) => {
    const client = new DynamoDBClient();
    const command = new PutItemCommand({
        TableName,
        Item: {
            'city': {
                'S': city
            },
            'data': {
                'S': JSON.stringify(data)
            }
        },
    });
    return await client.send(command);
}

// Export storeindb function for testing
export { storeInDb };


// Lambda Handler (starting poing)
exports.handler = async () => {
    // Call our DynamoDB retrieval function
    const checkDB = await retrieveFromDb(queryLocation);

    // Check DynamoDB content
    if (checkDB.Items && checkDB.Items.length > 0) {
        // Item exists, checking freshness
        const now = Date.now() / 1000;
        const item: any = JSON.parse(checkDB.Items[0].data.S!);
        if (Number(item.dt) > (now - freshness)) {
            // Item is fresh enough, return it as a response
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ response: item }),
            };
        }
    }

    // Item is not fresh or inexistant
    // Call OpenWeatherMap API
    const response = await instance.get('/weather')
    try {
        // Store response in DynamoDB
        await storeInDb(queryLocation, response.data);

        // Send response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: response.data }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "An error occurred while fetching the weather data.", error }),
        }
    }
};