import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { storeInDb, retrieveFromDb } from './index';

jest.mock('@aws-sdk/client-dynamodb', () => {
    const mDynamoDBClient = {
        send: jest.fn()
    };
    return {
        DynamoDBClient: jest.fn(() => mDynamoDBClient),
        PutItemCommand: jest.fn(),
        QueryCommand: jest.fn()
    };
});

describe('storeInDb', () => {
    const TableName = process.env.TABLE_NAME;
    const city = 'Paris, France';
    const data = { temp: 20 };

    it('should store data in DynamoDB', async () => {
        const mDynamoDBClient = new DynamoDBClient();
        const mPutItemCommand = new PutItemCommand({
            TableName,
            Item: {
                'city': { 'S': city },
                'data': { 'S': JSON.stringify(data) }
            }
        });

        await storeInDb(city, data);

        expect(DynamoDBClient).toHaveBeenCalled();
        expect(PutItemCommand).toHaveBeenCalledWith({
            TableName,
            Item: {
                'city': { 'S': city },
                'data': { 'S': JSON.stringify(data) }
            }
        });
        expect(mDynamoDBClient.send).toHaveBeenCalledWith(mPutItemCommand);
    });
});

describe('retrieveFromDb', () => {
    const TableName = process.env.TABLE_NAME;
    const city = 'Paris, France';

    it('should retrieve data from DynamoDB', async () => {
        const mDynamoDBClient = new DynamoDBClient();
        const mQueryCommand = new QueryCommand({
            TableName,
            KeyConditionExpression: 'city = :city',
            ExpressionAttributeValues: {
                ':city': { 'S': city }
            }
        });

        await retrieveFromDb(city);

        expect(DynamoDBClient).toHaveBeenCalled();
        expect(QueryCommand).toHaveBeenCalledWith({
            TableName,
            KeyConditionExpression: 'city = :city',
            ExpressionAttributeValues: {
                ':city': { 'S': city }
            }
        });
        expect(mDynamoDBClient.send).toHaveBeenCalledWith(mQueryCommand);
    });
});